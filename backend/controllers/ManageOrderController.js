// backend/controllers/ManageOrderController.js
const Order = require("../models/OrderModels");
const sendEmail = require("../utils/Mailer");
const { generateOrderEmailTemplate } = require("../utils/emailTemplates");
const { generateReceiptPDF } = require("../utils/pdfGenerator");

// 🟢 Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
};

// 🟢 Get a single order by ID (Admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order details." });
  }
};

// 🟢 Update order status (Admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "Processing",
      "Accepted",
      "Cancelled",
      "Out for Delivery",
      "Delivered",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed: Processing, Accepted, Cancelled, Out For Delivery, Delivered.",
      });
    }

    // Populate user to get email and order items
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("orderItems.product", "name");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    
    if (status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save();

    // Send email notification for status change
    try {
      const emailTemplate = generateOrderEmailTemplate(order, order.user, status);
      const emailOptions = {
        email: order.user.email,
        subject: `Order ${status} - #${order._id}`,
        message: emailTemplate,
      };

      // Only attach PDF for Delivered status
      if (status === "Delivered") {
        try {
          console.log(`📄 Generating PDF receipt for order #${order._id}`);
          const pdfBuffer = await generateReceiptPDF(order, order.user);
          
          emailOptions.attachments = [
            {
              filename: `HarmoniaHub_Receipt_${order._id}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ];
          console.log(`✅ PDF receipt generated and attached for order #${order._id}`);
        } catch (pdfError) {
          console.error('❌ Failed to generate PDF:', pdfError);
          // Continue without PDF attachment but log the error
        }
      }

      console.log(`📧 Sending ${status} email to: ${order.user.email}`);
      
      // Add delay to avoid Mailtrap rate limiting (2 seconds delay)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await sendEmail(emailOptions);
      console.log(`✅ Status update email sent for order #${order._id} to ${order.user.email}`);

    } catch (emailError) {
      console.error("❌ Failed to send email:", emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({ 
      success: true, 
      message: "Order status updated and notification sent.", 
      order 
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ success: false, message: "Failed to update order." });
  }
};

// 🟢 Delete order (Admin)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    await order.deleteOne();
    res.status(200).json({ success: true, message: "Order deleted successfully." });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Failed to delete order." });
  }
};