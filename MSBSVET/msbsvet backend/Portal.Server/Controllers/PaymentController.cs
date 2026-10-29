using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Exam;
using Portal.Business.Worker.Fee;

namespace Portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        private readonly FeeWorker _feeWorker;

      
        public PaymentController(FeeWorker feeWorker)
        {
            _feeWorker = feeWorker ?? throw new ArgumentNullException(nameof(feeWorker));
            _paymentService = new PaymentService(_feeWorker);
        }

        [HttpPost("CreateOrder")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "Invalid request data"
                    });
                }

                if (request.Amount <= 0)
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "Amount must be greater than 0"
                    });
                }

                if (string.IsNullOrEmpty(request.Receipt))
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "Receipt is required"
                    });
                }

                var notes = new Dictionary<string, object>();

                if (request.Notes != null)
                {
                    if (!string.IsNullOrEmpty(request.Notes.PayeeId))
                        notes.Add("payee_id", request.Notes.PayeeId);
                    
                    if (!string.IsNullOrEmpty(request.Notes.PhaseId))
                        notes.Add("phase_id", request.Notes.PhaseId);
                    
                    if (!string.IsNullOrEmpty(request.Notes.ApplicationId))
                        notes.Add("application_id", request.Notes.ApplicationId);
                    
                    if (!string.IsNullOrEmpty(request.Notes.PayeeName))
                        notes.Add("payee_name", request.Notes.PayeeName);
                    
                    if (!string.IsNullOrEmpty(request.Notes.Purpose))
                        notes.Add("purpose", request.Notes.Purpose);
                }

                var result = await _paymentService.CreateRazorpayOrder(
                    request.Amount / 100m, // Convert paise to rupees
                    request.Receipt,
                    notes
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Status = "Error",
                    Message = "Failed to create order",
                    Details = ex.Message
                });
            }
        }

        [HttpPost("VerifyPayment")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "Invalid request data"
                    });
                }

                if (string.IsNullOrEmpty(request.OrderId) || 
                    string.IsNullOrEmpty(request.PaymentId) || 
                    string.IsNullOrEmpty(request.Signature))
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "OrderId, PaymentId, and Signature are required"
                    });
                }

                var result = await _paymentService.VerifyAndUpdatePayment(
                    request.OrderId,
                    request.PaymentId,
                    request.Signature
                );

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Status = "Error",
                    Message = "Failed to verify payment",
                    Details = ex.Message
                });
            }
        }

        [HttpGet("CheckPayment/{orderId}")]
        public async Task<IActionResult> CheckPayment(string orderId)
        {
            try
            {
                if (string.IsNullOrEmpty(orderId))
                {
                    return BadRequest(new
                    {
                        Status = "Error",
                        Message = "OrderId is required"
                    });
                }

                var result = await _paymentService.CheckRazorpayPayment(orderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Status = "Error",
                    Message = "Failed to check payment status",
                    Details = ex.Message
                });
            }
        }
    }

    // Request models
    public class CreateOrderRequest
    {
        public int Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Receipt { get; set; }
        public OrderNotes Notes { get; set; }
    }

    public class OrderNotes
    {
        public string PayeeId { get; set; }
        public string PhaseId { get; set; }
        public string ApplicationId { get; set; }
        public string PayeeName { get; set; }
        public string Purpose { get; set; }
    }

    public class VerifyPaymentRequest
    {
        public string OrderId { get; set; }
        public string PaymentId { get; set; }
        public string Signature { get; set; }
    }
}