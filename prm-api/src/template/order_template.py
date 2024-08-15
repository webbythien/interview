from jinja2 import Template

template_string = """
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 0;
        }
        .header-image {
            width: 100%;
            text-align: center;
            padding: 20px 0;
        }
        .header-image img {
            max-width: 100%;
            height: 50%;
        }
        .content {
            padding: 20px;
        }
        h2 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
        }
        .invoice-table th, .invoice-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .invoice-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            color: #2c3e50;
        }
        .invoice-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .total-row {
            font-weight: bold;
            background-color: #e8f4f8 !important;
        }
        .shipping-row td, .total-row td {
            border-top: 2px solid #3498db;
        }
        .right-align {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header-image">
        <img src="https://s3-stag.esollabs.com/trigseg/img/150698b2-a8fb-47eb-a1d4-bd8de06eaa73.png" alt="Header Image">
    </div>
    <div class="content">
        <h2>Hello {{ name }},</h2>
        <p>Thank you for your order. Here's your invoice:</p>
        <table class="invoice-table">
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
            </tr>
            {{ product_rows | safe }}
            <tr class="shipping-row">
                <td colspan="3" class="right-align">Shipping Fee:</td>
                <td>{{ shipping_fee }}</td>
            </tr>
            <tr class="total-row">
                <td colspan="3" class="right-align">Total:</td>
                <td>{{ total }}</td>
            </tr>
        </table>
        <p>If you have any questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Bamboo Handicraft</p>
    </div>
</body>
</html>
"""