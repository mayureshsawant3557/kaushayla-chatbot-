
using Razorpay.Api;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Portal.Entities.Fee;
using System.Security.Cryptography;
using Portal.Business.Worker.Fee;
using Twilio.TwiML.Fax;

namespace Portal.Server.Controllers
{
    internal class PaymentService
    {
        private readonly FeeWorker _feeWorker;

        public PaymentService(FeeWorker feeWorker)  // Constructor injection
        {
            _feeWorker = feeWorker ?? throw new ArgumentNullException(nameof(feeWorker));
        }

        private readonly string _key = "rzp_test_er5gJgaSzluxIH"; 
        private readonly string _secret = "7Mocxax5h4rSp3UzyX7KQgdi"; 

        // Create Razorpay Order
        public async Task<object> CreateRazorpayOrder(decimal amount, string receipt, Dictionary<string, object> notes)
        {
            try
            {
                RazorpayClient client = new RazorpayClient(_key, _secret);

                Dictionary<string, object> options = new Dictionary<string, object>
                {
                    {"amount", amount * 100}, // Amount in paise 
                    {"currency", "INR"},
                    {"receipt", receipt},
                    {"notes", notes}
                };

                Order order = client.Order.Create(options);

                return new
                {
                    Status = "Success",
                    Data = new
                    {
                        id = order["id"].ToString(),
                        amount = Convert.ToInt32(order["amount"]),
                        currency = order["currency"].ToString(),
                        receipt = order["receipt"].ToString(),
                        status = order["status"].ToString()
                    }
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = "Error",
                    ex.Message
                };
            }
        }

        public async Task<object> VerifyAndUpdatePayment(string orderId, string paymentId, string signature)
        {
            try
            {
                RazorpayClient client = new RazorpayClient(_key, _secret);

                //RazorpayClient client = new RazorpayClient(_key, _secret);
                Order order = client.Order.Fetch(orderId);

                // Step  Verify signature
                string payload = $"{orderId}|{paymentId}";
                string generatedSignature;


                var orderStatus = order["status"].ToString();
                string receipt = order["receipt"].ToString();

                using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_secret)))
                {
                    var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                    generatedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();
                }

                if (generatedSignature != signature.ToLower())
                {
                    return new
                    {
                        Status = "Error",
                        Message = "Payment signature verification failed"
                    };
                }

                // Step Fetch the order
                //Order order = client.Order.Fetch(orderId);
                //if (order == null || order["status"].ToString() != "paid")
                //{
                //    return new
                //    {
                //        Status = "Error",
                //        Message = "Order not found or not marked as paid"
                //    };
                //}

                // Step Find the successful payment
                List<Payment> payments = order.Payments();
                Payment successfulPayment = payments.FirstOrDefault(p =>
                    p["id"].ToString() == paymentId && p["status"].ToString() == "captured");

                if (successfulPayment == null)
                {
                    return new
                    {
                        Status = "Error",
                        Message = "Captured payment not found for the given Payment ID"
                    };
                }

                // Step Create transaction entity
                FeeTransactionEntity ft = new FeeTransactionEntity
                {
                    TransactionID = GetTransactionIdFromReceipt(receipt),
                    PayeeID =(short) GetPayeeIdFromReceipt(order["receipt"].ToString()),
                    PhaseID =(short) GetPhaseIdFromReceipt(order["receipt"].ToString()),
                    PayeeDisplayApplicationId = GetApplicationIdFromNotes(order["notes"]),
                    PayeeName = GetPayeeNameFromNotes(order["notes"]),
                    FeeAmount = Convert.ToDecimal(successfulPayment["amount"]) / 100,
                    ServiceCharge = 0,
                    TotalAmount = Convert.ToDecimal(successfulPayment["amount"]) / 100,
                    IsValid = true,
                    IsPaid = true,
                    IsReconciled = false,
                    TransactionDate = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                    BankRefereneceNo = successfulPayment["id"].ToString(),
                    PayGateID = successfulPayment["id"].ToString(),
                    PaymentDate = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
                    Purpose = GetPurposeFromNotes(order["notes"]),
                    Optional1 = orderId,
                    Optional2 = successfulPayment["method"].ToString(),
                    Optional3 = signature,
                    GatewayResponse = JsonConvert.SerializeObject(successfulPayment),
                    TxStatus = "SUCCESS",
                    PaymentVendor = "Razorpay",
                    IsPushResponse = true,
                    IsAPICheck = true,
                    VendorId = (short)1, 
                    OrderId = orderId
                };

                // Step  Save the transaction 
                _feeWorker.SetFeeTransactionResponse(ft);



                // Step  Return result
                return new
                {
                    Status = "Success",
                    Message = "Payment verified and transaction updated successfully",
                    Data = new
                    {
                        TransactionId = ft.TransactionID,
                        PaymentId = paymentId,
                        OrderId = orderId,
                        Amount = ft.FeeAmount,
                        Status = "SUCCESS"
                    }
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = "Error",
                    Message = "Payment verification failed",
                    Details = ex.Message
                };
            }
        }


        // Check Payment Status
        public async Task<object> CheckRazorpayPayment(string orderId)
        {
            try
            {
                RazorpayClient client = new RazorpayClient(_key, _secret);
                Order order = client.Order.Fetch(orderId);

                if (order != null)
                {
                    var orderStatus = order["status"].ToString();

                    if (orderStatus == "paid")
                    {
                        string receipt = order["receipt"].ToString();
                        List<Payment> payments = order.Payments();

                        var successfulPayments = new List<object>();

                        if (payments != null && payments.Count > 0)
                        {
                            foreach (Payment payment in payments)
                            {
                                if (payment["status"].ToString() == "captured")
                                {
                                    successfulPayments.Add(new
                                    {
                                        PaymentId = payment["id"].ToString(),
                                        Amount = Convert.ToDecimal(payment["amount"]) / 100,
                                        Method = payment["method"].ToString(),
                                        Status = payment["status"].ToString(),
                                        CreatedAt = payment["created_at"]
                                    });

                                    // Create and save transaction entity
                                    FeeTransactionEntity ft = new FeeTransactionEntity
                                    {
                                        TransactionID = GetTransactionIdFromReceipt(receipt),
                                        Optional2 = payment["method"].ToString(),
                                        PayGateID = payment["id"].ToString(),
                                        BankRefereneceNo = payment["id"].ToString(),
                                        FeeAmount = Convert.ToDecimal(payment["amount"]) / 100,
                                        IsPaid = true,
                                        IsValid = true,
                                        GatewayResponse = JsonConvert.SerializeObject(payment),
                                        TxStatus = "SUCCESS",
                                        PaymentVendor = "Razorpay",
                                        OrderId = orderId
                                    };

                                    
                                     _feeWorker.SetFeeTransactionResponse(ft);
                                }
                            }
                        }

                        return new
                        {
                            Status = "Success",
                            Message = "Payment found and verified",
                            Data = new
                            {
                                OrderId = orderId,
                                OrderStatus = orderStatus,
                                Receipt = receipt,
                                Payments = successfulPayments
                            }
                        };
                    }
                    else
                    {
                        return new
                        {
                            Status = "Pending",
                            Message = $"Order status: {orderStatus}",
                            Data = new
                            {
                                OrderId = orderId,
                                OrderStatus = orderStatus
                            }
                        };
                    }
                }

                return new
                {
                    Status = "Error",
                    Message = "Order not found"
                };
            }
            catch (Exception ex)
            {
                return new
                {
                    Status = "Error",
                    ex.Message
                };
            }
        }

        // Helper methods to extract data from receipt and notes
        private long GetPayeeIdFromReceipt(string receipt)
        {
            try
            {
                // Extract PayeeID from receipt format: receipt_PayeeID_PhaseID_timestamp
                var parts = receipt.Split('_');
                if (parts.Length >= 2)
                {
                    return Convert.ToInt64(parts[1]);
                }
            }
            catch { }
            return 0;
        }

        private int GetPhaseIdFromReceipt(string receipt)
        {
            try
            {
                var parts = receipt.Split('_');
                if (parts.Length >= 3)
                {
                    return Convert.ToInt32(parts[2]);
                }
            }
            catch { }
            return 0;
        }

        private long GetTransactionIdFromReceipt(string receipt)
        {
            try
            {
                var parts = receipt.Split('_');
                if (parts.Length >= 4)
                {
                    return Convert.ToInt64(parts[3]);
                }
            }
            catch { }
            return 0;
        }

        private string GetApplicationIdFromNotes(dynamic notes)
        {
            try
            {
                if (notes != null && notes["application_id"] != null)
                {
                    return notes["application_id"].ToString();
                }
            }
            catch { }
            return "";
        }

        private string GetPayeeNameFromNotes(dynamic notes)
        {
            try
            {
                if (notes != null && notes["payee_name"] != null)
                {
                    return notes["payee_name"].ToString();
                }
            }
            catch { }
            return "";
        }

        private string GetPurposeFromNotes(dynamic notes)
        {
            try
            {
                if (notes != null && notes["purpose"] != null)
                {
                    return notes["purpose"].ToString();
                }
            }
            catch { }
            return "";
        }
    }
}