using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Portal.Business.Interface.Fee;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Fee;
using Portal.Entities.Account;
using Portal.Entities.Fee;
using Portal.Entities.ResponseBody;
using Razorpay.Api;
using System.ComponentModel.DataAnnotations;

namespace Portal.Server.Controllers.Fee
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeeController : ControllerBase
    {
        private readonly IFee _feeService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FeeController> _logger;
        //public FeeController(IFee feeService)
        //{
        //    _feeService = feeService ?? throw new ArgumentNullException(nameof(feeService));
        //}

        public FeeController(IFee feeService, IConfiguration configuration, ILogger<FeeController> logger)
        {
            _feeService = feeService ?? throw new ArgumentNullException(nameof(feeService));
            _configuration = configuration;
            _logger = logger;
        }


        //       [HttpGet("info")]
        //       public async Task<IActionResult> GetFeeInfo([FromQuery] FeeInfoRequest request)
        //       {
        //           try
        //           {
        //               // Validate hash code for security
        //               if (!ValidateHashCode(request.CandidateId, request.HashCode))
        //               {
        //                   return BadRequest(ApiResponse<object>.ErrorResponse(
        //                       "Your url has been modified.",
        //                       400
        //                   ));
        //               }

        //               var user = GetCurrentUser(); // Implement based on your auth system
        //               if (user == null)
        //               {
        //                   return Unauthorized();
        //               }

        //               // Check failed transactions
        //               if (user.UserTypeID == 91 || user.UserTypeID == 61 || user.UserTypeID == 64)
        //               {
        //                   await CheckFailedTransactions(request.CandidateId);
        //               }

        //               var feeData = _feeService.GetFeeToPay(request.CandidateId, request.PhaseId);

        //               if (feeData == null)
        //               {
        //                   return Ok(ApiResponse<FeeInfoResponse>.ErrorResponse(
        //                       "Currently you do not have any pending fee to pay.",
        //                       200 
        //                   ));
        //               }

        //               if (!feeData.Fee.IsEligibleToPay)
        //               {
        //                   return Ok(ApiResponse<FeeInfoResponse>.ErrorResponse(
        //                       feeData.Fee.NotEligibleMsg,
        //                       200 
        //                   ));
        //               }

        //               var response = new FeeInfoResponse
        //               {
        //                   Fee = feeData.Fee,
        //                   PaidTransactions = feeData.PaidTransactions,
        //                   Labels = GetLabelsForUserType(user.UserTypeID, request.PhaseId),
        //                   IsEligible = feeData.Fee.IsEligibleToPay,
        //                   HasPendingFee = feeData.Fee.FeeAmount > 0
        //               };

        //               return Ok(ApiResponse<FeeInfoResponse>.SuccessResponse(
        //                          response,
        //                      "Fee information retrieved successfully"
        //                           ));
        //           }
        //           catch (Exception ex)
        //           {
        //               _logger.LogError(ex, "Error getting fee info for CandidateId: {CandidateId}, PhaseId: {PhaseId}",
        //                   request.CandidateId, request.PhaseId);
        //               return StatusCode(500, ApiResponse<object>.ErrorResponse(
        //    ex.Message,
        //    500
        //));
        //           }
        //       }
        [AllowAnonymous]
        [HttpPost("initiate-payment")]
        public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequest request)
        {
            try
            {


                if (request.FeeAmount <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Currently no fee to pay.",
                        400
                    ));
                }

                //var user = GetCurrentUser();
                //if (user == null)
                //{
                //    return Unauthorized();
                //}

                // Validate parameters


                if (request.PhaseId <= 0 || request.CandidateId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Your URL has been modified.",
                        400
                    ));
                }

                string vendorId = "1";
                // Set fee transaction using your existing worker
                var feeResponse = _feeService.SetFeeTransaction(
                    request.CandidateId,
                    request.PhaseId,
                    vendorId,
                    GetUserHostAddress()
                );

                if (feeResponse?.SuccessFlag == "Y" && feeResponse.TransactionID > 0)
                {
                    // Create Razorpay order
                    var razorpayResponse = await CreateRazorpayOrder(feeResponse.TransactionID);

                    return Ok(ApiResponse<InitiatePaymentResponse>.SuccessResponse(
                   new InitiatePaymentResponse
                   {
                       TransactionId = feeResponse.TransactionID,
                       RazorpayOrder = razorpayResponse
                   },
                   "Payment initiated successfully"
               ));
                }
                else
                {
                    var errorMsg = feeResponse?.ErrorMessage?.Length > 1
                        ? feeResponse.ErrorMessage
                        : "Payment is Already Done.";

                    return BadRequest(ApiResponse<object>.ErrorResponse(
                         errorMsg,
                         400
                     ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initiating payment for CandidateId: {CandidateId}", request.CandidateId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
     ex.Message,
     500
 ));
            }
        }
        [AllowAnonymous]
        [HttpPost("handle-response")]
        public async Task<IActionResult> HandlePaymentResponse([FromBody] RazorpayResponseRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.RazorpayPaymentId))
                {
                    return Ok(ApiResponse<PaymentResponseResult>.SuccessResponse(
                                                    new PaymentResponseResult
                                                    {
                                                        Success = false,
                                                        RedirectUrl = _configuration["FAIL_URL"]
                                                    },
                                                    "Payment failed"
                                                ));
                }

                // Verify signature
                var client = new RazorpayClient(
                    _configuration["Razorpay:RazorPayKey"],
                    _configuration["Razorpay:RazorPaySecret"]
                );

                var attributes = new Dictionary<string, string>
                {
                    {"razorpay_payment_id", request.RazorpayPaymentId},
                    {"razorpay_order_id", request.RazorpayOrderId},
                    {"razorpay_signature", request.RazorpaySignature}
                };

                Utils.verifyPaymentSignature(attributes);

                // Fetch payment details
                Payment payment = client.Payment.Fetch(request.RazorpayPaymentId);

                if (payment["status"] == "captured")
                {
                    Order order = client.Order.Fetch(request.RazorpayOrderId);

                    var feeTransaction = new FeeTransactionEntity
                    {
                        TransactionID = Convert.ToInt64(order["receipt"]),
                        Optional2 = payment["method"],
                        PayGateID = "",
                        BankRefereneceNo = request.RazorpayPaymentId,
                        FeeAmount = Convert.ToDecimal(payment["amount"]) / 100.00m,
                        IsPaid = true,
                        IsValid = true,
                        GatewayResponse = JsonConvert.SerializeObject(payment)
                    };

                    var processResult = await ProcessPaymentResponse(feeTransaction);

                    if (processResult.Success)
                    {
                        return Ok(ApiResponse<PaymentResponseResult>.SuccessResponse(
                            processResult,
                            "Payment processed successfully"
                        ));
                    }
                    else
                    {

                        return Ok(new ApiResponse<PaymentResponseResult>(
                            "Error",
                            200,
                            "Payment processing failed",
                            processResult
                        ));
                    }
                }
                else
                {
                    return Ok(ApiResponse<PaymentResponseResult>.SuccessResponse(
     new PaymentResponseResult
     {
         Success = false,
         RedirectUrl = _configuration["FAIL_URL"]
     },
     "Payment not captured"
 ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling payment response");
                return Ok(ApiResponse<PaymentResponseResult>.SuccessResponse(
    new PaymentResponseResult
    {
        Success = false,
        RedirectUrl = $"../Fee/Error.aspx?ErrorMessage={ex.Message}"
    },
    "Error processing payment response"
));
            }
        }

        [HttpGet("success/{transactionId}")]
        public async Task<IActionResult> GetSuccessDetails(long transactionId)
        {
            try
            {
                if (transactionId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Your transaction Id has been modified in url.",
                        400
                    ));
                }

                var entity = _feeService.GetTransactionDetails(transactionId);

                if (entity?.TransactionID > 0)
                {
                    // Send SMS and Email notifications
                    await SendNotifications(entity);

                    var successMessage = BuildSuccessMessage(entity, transactionId);

                    return Ok(ApiResponse<SuccessDetailsResponse>.SuccessResponse(
     new SuccessDetailsResponse
     {
         SuccessMessage = successMessage,
         TransactionDetails = new TransactionDetails
         {
             TransactionID = transactionId,
             PaymentId = entity.BankRefereneceNo,
             Amount = entity.FeeAmount,
             PayeeName = entity.PayeeName,
             ApplicationId = entity.PayeeDisplayApplicationId,
             PhaseId = entity.PhaseID
         }
     },
     "Transaction details retrieved successfully"
 ));
                }
                else
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
      "Unable to find the details. Please check Payment History Link.",
      404
  ));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting success details for TransactionId: {TransactionId}", transactionId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
     ex.Message,
     500
 ));
            }
        }

        [HttpGet("transaction-history/{payeeId}")]
        public async Task<IActionResult> GetTransactionHistory(long payeeId, [FromQuery] int userTypeId = 91)
        {
            try
            {
                await CheckFailedTransactions(payeeId);
                var transactions = _feeService.GetTransactionHistory(payeeId, userTypeId);

                return Ok(ApiResponse<List<FeeTransactionEntity>>.SuccessResponse(
    transactions,
    "Transaction history retrieved successfully"
));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting transaction history for PayeeId: {PayeeId}", payeeId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
     ex.Message,
     500
 ));
            }
        }

        [HttpGet("check-fee-paid/{payeeId}/{phaseId}")]
        public async Task<IActionResult> CheckIfFeePaid(long payeeId, int phaseId)
        {
            try
            {
                var isPaid = _feeService.IsPhaseWiseFeePaid(payeeId, phaseId);

                return Ok(ApiResponse<bool>.SuccessResponse(
     isPaid,
     isPaid ? "Fee is paid" : "Fee is not paid"
 ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking fee paid status for PayeeId: {PayeeId}, PhaseId: {PhaseId}", payeeId, phaseId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
    ex.Message,
    500
));
            }
        }

        [HttpGet("download-status/{payeeId}/{phaseId}")]
        public async Task<IActionResult> GetDownloadStatus(long payeeId, int phaseId)
        {
            try
            {
                var downloadInfo = _feeService.IsDownloadCETApplicationFormFeePaid(payeeId, phaseId);

                return Ok(ApiResponse<DownloadFileEntity>.SuccessResponse(
     downloadInfo,
     "Download status retrieved successfully"
 ));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting download status for PayeeId: {PayeeId}, PhaseId: {PhaseId}", payeeId, phaseId);
                return StatusCode(500, ApiResponse<object>.ErrorResponse(
    ex.Message,
    500
));
            }
        }

        // Private helper methods
        private bool ValidateHashCode(long candidateId, int hashCode)
        {
            return candidateId.ToString().GetHashCode() == hashCode;
        }

        //private LoggedInUser GetCurrentUser()
        //{
        //    // Implement based on your authentication system
        //    // This could be from JWT token, session, etc.
        //    // For example:
        //    // var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //    // return _userService.GetUser(userId);

        //    // Placeholder implementation - replace with your auth logic
        //    return new LoggedInUser
        //    {
        //        UserTypeID = 91, // Example user type
        //        UserLoginID = "admin"
        //    };
        //}

        private string GetUserHostAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }

        private async Task CheckFailedTransactions(long candidateId)
        {
            try
            {
                var failedTransactions = _feeService.GetFailedTransactionForAPICheck(candidateId);

                if (failedTransactions?.Any() == true)
                {
                    foreach (var transaction in failedTransactions)
                    {
                        if (!string.IsNullOrEmpty(transaction.OrderId))
                        {
                            await CheckRazorpayPayment(transaction.OrderId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking failed transactions for candidate {CandidateId}", candidateId);
            }
        }

        private async Task CheckRazorpayPayment(string orderId)
        {
            try
            {
                var client = new RazorpayClient(
                   _configuration["Razorpay:RazorPayKey"],
                    _configuration["Razorpay:RazorPaySecret"]
                );

                Order order = client.Order.Fetch(orderId);

                if (order?["status"] == "paid")
                {
                    string transactionId = order["receipt"];
                    List<Payment> payments = client.Order.Fetch(orderId).Payments();

                    if (payments?.Any() == true)
                    {
                        foreach (Payment payment in payments)
                        {
                            if (payment["status"] == "captured")
                            {
                                var feeTransaction = new FeeTransactionEntity
                                {
                                    TransactionID = Convert.ToInt64(transactionId),
                                    Optional2 = payment["method"],
                                    PayGateID = "",
                                    BankRefereneceNo = payment["id"],
                                    FeeAmount = Convert.ToDecimal(payment["amount"]) / 100.00m,
                                    IsPaid = true,
                                    IsValid = true,
                                    GatewayResponse = JsonConvert.SerializeObject(payment),
                                    IsAPICheck = true
                                };

                                _feeService.SetFeeTransactionResponse(feeTransaction);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking Razorpay payment for order {OrderId}", orderId);
            }
        }

        private async Task<RazorpayOrderResponse> CreateRazorpayOrder(long transactionId)
        {
            var transaction = _feeService.GetTransactionDetails(transactionId);

            if (transaction?.TransactionID <= 0)
            {
                throw new ArgumentException("Invalid transaction details");
            }

            string key = _configuration["Razorpay:RazorPayKey"];

            string secret = _configuration["Razorpay:RazorPaySecret"];
            string currency = "INR";

            var orderNote = new Dictionary<string, string>
            {
                {"PID", transaction.PayeeDisplayApplicationId},
                {"Purpose", transaction.Purpose},
                {"Course", transaction.Course},
                {"AcademicYear", transaction.AcademicYear},
                {"CandidateName", transaction.PayeeName}
            };

            decimal orderAmount = transaction.FeeAmount * 100;
            long amount = Convert.ToInt64(orderAmount);

            var orderRequest = new Dictionary<string, object>
            {
                {"amount", amount},
                {"currency", currency},
                {"receipt", transaction.TransactionID.ToString()},
                {"notes", orderNote},
                {"payment_capture", "1"}
            };

            var client = new RazorpayClient(key, secret);
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12;
            System.Net.ServicePointManager.Expect100Continue = false;

            Order orderResponse = client.Order.Create(orderRequest);
            var orderId = orderResponse.Attributes["id"].ToString();

            if (!string.IsNullOrEmpty(orderId))
            {
                string saveResult = _feeService.SaveOrderId(transaction.TransactionID.ToString(), orderId);

                if (saveResult.ToUpper() == "Y")
                {
                    return new RazorpayOrderResponse
                    {
                        KeyId = key,
                        OrderId = orderId,
                        Amount = amount.ToString(),
                        Name = transaction.PayeeName,
                        Email = transaction.PayeeEMailID,
                        Mobile = transaction.PayeeMobileNo,
                        Description = transaction.Purpose,
                        Notes = JsonConvert.SerializeObject(orderNote),
                        CallbackUrl = _configuration["RazorPayReturnUrl"],
                        RequestUrl = _configuration["RazorPayRequestUrl"]
                    };
                }
            }

            throw new Exception("Failed to create Razorpay order");
        }

        private async Task<PaymentResponseResult> ProcessPaymentResponse(FeeTransactionEntity feeTransaction)
        {
            try
            {
                var response = _feeService.SetFeeTransactionResponse(feeTransaction);

                if (response.SuccessFlag == "Y" && feeTransaction.IsPaid)
                {
                    string bankReferenceNo = "--";
                    if (!string.IsNullOrEmpty(response.BankReferenceNo?.Trim()) && response.BankReferenceNo.Trim().Length > 3)
                    {
                        bankReferenceNo = response.BankReferenceNo;
                    }

                    return new PaymentResponseResult
                    {
                        Success = true,
                        RedirectUrl = $"Success?txnId={response.TransactionID}",
                        TransactionId = response.TransactionID,
                        BankReferenceNo = bankReferenceNo
                    };
                }
                else if (response.SuccessFlag == "Y" && !feeTransaction.IsPaid)
                {
                    var errorMessage = !string.IsNullOrEmpty(response.ErrorMessage?.Trim()) && response.ErrorMessage.Trim().Length > 5
                        ? response.ErrorMessage
                        : "Your transaction has been failed.";

                    return new PaymentResponseResult
                    {
                        Success = false,
                        RedirectUrl = $"../Fee/Failed.aspx?FailedMessage={errorMessage}"
                    };
                }
                else
                {
                    var errorMessage = !string.IsNullOrEmpty(response.ErrorMessage?.Trim()) && response.ErrorMessage.Trim().Length > 5
                        ? response.ErrorMessage
                        : "Transaction processing failed";

                    return new PaymentResponseResult
                    {
                        Success = false,
                        RedirectUrl = $"../Fee/Error.aspx?ErrorMessage={errorMessage}"
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment response");
                return new PaymentResponseResult
                {
                    Success = false,
                    RedirectUrl = $"../Fee/Error.aspx?ErrorMessage={ex.Message}"
                };
            }
        }

        private async Task SendNotifications(FeeTransactionEntity entity)
        {
            try
            {
                if (entity.PayeeDisplayApplicationId.Contains("/"))
                {
                    string userLoginId = entity.PayeeDisplayApplicationId.Split('/')[0];

                    // Send SMS - You'll need to implement your messaging service
                    // var smsData = await _messagingService.GetEmailSMS("PaymentSucess", "S", userLoginId, entity.TotalAmount.ToString());

                    // Send Email - You'll need to implement your email service
                    // var emailData = await _messagingService.GetEmailSMS("AdmissionReject", "E", userLoginId);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending notifications");
            }
        }

        private string BuildSuccessMessage(FeeTransactionEntity entity, long transactionId)
        {
            if (entity.PhaseID == 3)
            {
                return $"Congratulations! Your payment has been made successfully.<br/>" +
                       $"Institute Profile ID: <b>{entity.PayeeApplicationID}</b><br/>" +
                       $"Name of Institute: <b>{entity.PayeeName}</b><br/>" +
                       $"Fee Type: <b>New Institute Registration Fees</b><br/>" +
                       $"Transaction ID: <b>{transactionId}</b><br/>" +
                       $"PaymentId: <b>{entity.BankRefereneceNo}</b><br/>" +
                       $"Amount(Rs.): <b>{entity.FeeAmount}</b><br/>" +
                       $"Please click on <b>Go To Transaction History</b> tab to print receipt.";
            }
            else
            {
                return $"Congratulations! Your payment has been made successfully.<br/>" +
                       $"Transaction ID: <b>{transactionId}</b><br/>" +
                       $"PaymentId: <b>{entity.BankRefereneceNo}</b><br/>" +
                       $"Amount(Rs.): <b>{entity.FeeAmount}</b><br/>" +
                       $"Please click on <b>Go To Transaction History</b> tab to print receipt.";
            }
        }

        private Dictionary<string, string> GetLabelsForUserType(int userTypeId, int phaseId)
        {
            var labels = new Dictionary<string, string>();

            if (userTypeId == 91)
            {
                labels["ApplicationIdHeading"] = "Application ID";
                labels["CandidateNameHeading"] = "Candidate Name";
                labels["AdmissionSessionHeading"] = "Admission Session";
                labels["CourseTypeHeading"] = "Course Type";
                labels["ApplicationFormFee"] = "Application Form Fee";
                labels["PaidTransactionsHeading"] = "Paid Transactions";
                labels["ProceedText"] = "Proceed >>>";

                if (phaseId == 2)
                {
                    labels["ApplicationIdHeading"] = "Batch";
                    labels["CandidateNameHeading"] = "Institute Name";
                }
            }
            else if (userTypeId == 61 || userTypeId == 64)
            {
                labels["ApplicationIdHeading"] = "College ID";
                labels["CandidateNameHeading"] = "College Name";
                labels["AdmissionSessionHeading"] = "Admission Session";
                labels["CourseTypeHeading"] = "Purpose";
                labels["ApplicationFormFee"] = "Fee";
                labels["PaidTransactionsHeading"] = "Paid Transactions";
                labels["ProceedText"] = "Proceed >>>";
            }

            return labels;
        }













        [HttpGet]
        [Route("GetTransactionWiseCandidateList")]
        public IActionResult GetTransactionWiseCandidateList(long TransactionID)
        {
            if (TransactionID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Transaction ID.", 400));
            var result = _feeService.GetTransactionWiseCandidateList(TransactionID);

            if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                return NotFound(ApiResponse<string>.ErrorResponse("No candidates found for the given transaction ID.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidates retrieved successfully.", 200));


        }
        [HttpPost]
        [Route("SetFeePushResponse")]
        public IActionResult SetFeePushResponse([FromBody] FeeTransactionEntity feeTransaction)
        {
            if (feeTransaction == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid fee transaction data.", 400));
            var result = _feeService.SetFeePushResponse(feeTransaction);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee push response set successfully.", 200));
        }

        //[HttpPost]
        //[Route("GetFailedTransactionForAPICheck")]
        //public IActionResult GetFailedTransactionForAPICheck(long PayeeID)
        //{
        //    if (PayeeID <= 0)
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Payee ID.", 400));
        //    var result = _feeService.GetFailedTransactionForAPICheck(PayeeID);
        //    if (result == null || !result.Any())
        //        return NotFound(ApiResponse<string>.ErrorResponse("No failed transactions found for the given Payee ID.", 404));
        //    return Ok(ApiResponse<object>.SuccessResponse(result, "Failed transactions retrieved successfully.", 200));
        //}
        //[HttpGet]
        //[Route("GetTransactionHistory")]
        //public IActionResult GetTransactionHistory([FromQuery] long PayeeID, [FromQuery] int userTypeId = 91)
        //{
        //    if (PayeeID <= 0)
        //        return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Payee ID.", 400));
        //    var result = _feeService.GetTransactionHistory(PayeeID, userTypeId);
        //    if (result == null || !result.Any())
        //        return NotFound(ApiResponse<string>.ErrorResponse("No transaction history found for the given Payee ID.", 404));
        //    return Ok(ApiResponse<object>.SuccessResponse(result, "Transaction history retrieved successfully.", 200));

        //}
        [HttpGet]
        [Route("IsDownloadCETApplicationFormFeePaid")]
        public IActionResult IsDownloadCETApplicationFormFeePaid([FromQuery] long PayeeID, [FromQuery] int PhaseID)
        {
            if (PayeeID <= 0 || PhaseID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Payee ID or Phase ID.", 400));
            var result = _feeService.IsDownloadCETApplicationFormFeePaid(PayeeID, PhaseID);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("No fee payment record found for the given Payee ID and Phase ID.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee payment status retrieved successfully.", 200));
        }
        [AllowAnonymous]
        [HttpGet]
        [Route("GetFeeToPay")]
        public IActionResult GetFeeToPay([FromQuery] long PayeeID, [FromQuery] int PhaseID)
        {
            if (PayeeID <= 0 || PhaseID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Payee ID or Phase ID.", 400));
            var result = _feeService.GetFeeToPay(PayeeID, PhaseID);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("No fee details found for the given Payee ID and Phase ID.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee details retrieved successfully.", 200));
        }


        [HttpPost]
        [Route("SetFeeTransaction")]
        public IActionResult SetFeeTransaction([FromBody] FeeTransactionEntity feeTransaction, string IPAddress)
        {
            if (feeTransaction == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid fee transaction data.", 400));
            var result = _feeService.SetFeeTransaction(feeTransaction.PayeeID, feeTransaction.PhaseID, "1", IPAddress);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("Failed to set fee transaction.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee transaction set successfully.", 200));
        }


        [AllowAnonymous]
        [HttpPost]
        [Route("GetTransactionDetails")]
        public IActionResult GetTransactionDetails(long TransactionID)
        {
            if (TransactionID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Transaction ID.", 400));
            var result = _feeService.GetTransactionDetails(TransactionID);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("No transaction details found for the given Transaction ID.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Transaction details retrieved successfully.", 200));
        }
        [AllowAnonymous]
        [HttpPost]
        [Route("SetFeeTransactionResponse")]
        public IActionResult SetFeeTransactionResponse([FromBody] FeeTransactionEntity feeTransaction)
        {
            if (feeTransaction == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid fee transaction data.", 400));
            var result = _feeService.SetFeeTransactionResponse(feeTransaction);
            if (result == null)
                return NotFound(ApiResponse<string>.ErrorResponse("Failed to set fee transaction response.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee transaction response set successfully.", 200));
        }
        [HttpGet]
        [Route("IsPhaseWiseFeePaid")]
        public IActionResult IsPhaseWiseFeePaid([FromQuery] long PayeeID, [FromQuery] int PhaseID)
        {
            if (PayeeID <= 0 || PhaseID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Payee ID or Phase ID.", 400));
            var result = _feeService.IsPhaseWiseFeePaid(PayeeID, PhaseID);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Phase-wise fee payment status retrieved successfully.", 200));
        }
        [HttpPost]
        [Route("GetTransactionsForRefundCheck")]
        public IActionResult GetTransactionsForRefundCheck([FromBody] string PayeeInput)
        {
            if (string.IsNullOrWhiteSpace(PayeeInput))
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Payee input.", 400));
            var result = _feeService.GetTransactionsForRefundCheck(PayeeInput);
            if (result == null || !result.Any())
                return NotFound(ApiResponse<string>.ErrorResponse("No transactions found for the given Payee input.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Transactions for refund check retrieved successfully.", 200));
        }

        [HttpPost]
        [Route("RefundTransaction")]
        public IActionResult RefundTransaction(
      [FromForm] string transactionId,
      [FromForm] string userLoginId,
      [FromForm] string refundRequestId,
      [FromForm] string refundBankRRN,
      [FromForm] string commaNdName,
      [FromForm] string ipAddress)
        {
            if (string.IsNullOrWhiteSpace(transactionId) || string.IsNullOrWhiteSpace(userLoginId))
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid refund request data.", 400));

            var result = _feeService.RefundTransaction(
                transactionId,
                userLoginId,
                refundRequestId,
                refundBankRRN,
                commaNdName,
                ipAddress
            );

            return Ok(ApiResponse<object>.SuccessResponse(result, "Transaction refunded successfully.", 200));
        }

        [HttpPost]
        [Route("SaveOrderId")]
        public IActionResult SaveOrderId(
             [FromForm] string transactionId,
             [FromForm] string orderId)
        {
            if (string.IsNullOrWhiteSpace(transactionId) || string.IsNullOrWhiteSpace(orderId))
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid order ID request data.", 400));

            var result = _feeService.SaveOrderId(transactionId, orderId);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Order ID saved successfully.", 200));
        }

        [HttpPost]
        [Route("GetFeeCartItems")]
        public IActionResult GetFeeCartItems(long CartId)
        {
            if (CartId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Cart ID.", 400));
            var result = _feeService.GetFeeCartItems(CartId);
            var serializableData = BaseWorker.ConvertDataSetToList(result);
            if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                return NotFound(ApiResponse<string>.ErrorResponse("No fee cart items found for the given Cart ID.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Fee cart items retrieved successfully.", 200));
        }
        [HttpPost]
        [Route("SaveFeeCartItems")]
        public IActionResult SaveFeeCartItems([FromBody] List<CandidateListForPayment> lst, [FromQuery] long InstituteID, [FromQuery] long CourseID, [FromQuery] long BatchID, [FromQuery] string UserLoginId, [FromQuery] string IPAddress, [FromQuery] int phaseId)
        {
            if (lst == null || !lst.Any())
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid fee cart items data.", 400));
            var result = _feeService.SaveFeeCartItems(lst, InstituteID, CourseID, BatchID, UserLoginId, IPAddress, phaseId);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee cart items saved successfully.", 200));
        }

        [HttpPost]
        [Route("SaveFeeCartItemsForCourses")]
        public IActionResult SaveFeeCartItemsForCourses([FromBody] List<CourseListForPayment> lst, [FromQuery] long CollegeID, [FromQuery] string UserLoginId, [FromQuery] string IPAddress, [FromQuery] int phaseId)
        {
            if (lst == null || !lst.Any())
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid fee cart items data.", 400));
            var result = _feeService.SaveFeeCartItemsForCourses(lst, CollegeID, UserLoginId, IPAddress, phaseId);
            return Ok(ApiResponse<object>.SuccessResponse(result, "Fee cart items saved successfully.", 200));
        }



































    }
}





public class FeeInfoRequest
{
    public int PhaseId { get; set; }
    public long CandidateId { get; set; }
    public int HashCode { get; set; }
}

public class InitiatePaymentRequest
{
    [Required]
    public long CandidateId { get; set; }

    [Required]
    public int PhaseId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Fee amount must be greater than 0")]
    public decimal FeeAmount { get; set; }
}
public class InitiatePaymentResponse
{
    public long TransactionId { get; set; }
    public RazorpayOrderResponse RazorpayOrder { get; set; }
}
public class RazorpayResponseRequest
{
    [Required]
    public string RazorpayPaymentId { get; set; }

    [Required]
    public string RazorpayOrderId { get; set; }

    [Required]
    public string RazorpaySignature { get; set; }
}

// DTOs/Response Models
public class FeeInfoResponse
{
    public FeeEntity Fee { get; set; }
    public List<FeeTransactionEntity> PaidTransactions { get; set; }
    public Dictionary<string, string> Labels { get; set; }
    public bool IsEligible { get; set; }
    public bool HasPendingFee { get; set; }
}



public class RazorpayOrderResponse
{
    public string KeyId { get; set; }
    public string OrderId { get; set; }
    public string Amount { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Mobile { get; set; }
    public string Description { get; set; }
    public string Notes { get; set; }
    public string CallbackUrl { get; set; }
    public string RequestUrl { get; set; }
}

public class PaymentResponseResult
{
    public bool Success { get; set; }
    public string RedirectUrl { get; set; }
    public long? TransactionId { get; set; }
    public string BankReferenceNo { get; set; }
}
public class SuccessDetailsResponse
{
    public string SuccessMessage { get; set; }
    public TransactionDetails TransactionDetails { get; set; }
}

public class TransactionDetails
{
    public long TransactionID { get; set; }
    public string PaymentId { get; set; }
    public decimal Amount { get; set; }
    public string PayeeName { get; set; }
    public string ApplicationId { get; set; }
    public int PhaseId { get; set; }
}