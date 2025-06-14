import React from "react"
import { TransactionWithId } from "@/types/transaction"

interface ReceiptPrintTemplateProps {
  transaction: TransactionWithId
}

export default function ReceiptPrintTemplate({
  transaction,
}: ReceiptPrintTemplateProps) {
  const formattedDate = new Date(transaction.createdAt).toLocaleDateString(
    "id-ID",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )

  const formattedTime = new Date(transaction.createdAt).toLocaleTimeString(
    "id-ID",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  )

  const itemsRows = transaction.cards
    .map((card) => {
      const priceStr = card.pricePerKg.toLocaleString("id-ID")
      const qtyStr = card.weight
      const totalStr = card.totalPrice.toLocaleString("id-ID")
      const discountRow = card.useDiscount
        ? `<tr>
            <td style="padding-left:10px">Diskon</td>
            <td style="text-align:right">-${(
              card.discountPerKg ?? 0
            ).toLocaleString("id-ID")}</td>
            <td style="text-align:center">${qtyStr}</td>
            <td style="text-align:right">-${card.discount.toLocaleString(
              "id-ID"
            )}</td>
           </tr>`
        : ""
      return `
        <tr>
          <td style="padding:8px 4px;">${card.fabricName}</td>
          <td style="padding:8px 4px; text-align:right;">${priceStr}</td>
          <td style="padding:8px 4px; text-align:center;">${qtyStr}</td>
          <td style="padding:8px 4px; text-align:right;">${totalStr}</td>
        </tr>
        ${discountRow}
      `
    })
    .join("")

  const html = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #fff;
            color: #333;
          }
          .header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
          }
          .header img {
            width: 60px;
            height: 60px;
            margin-right: 10px;
          }
          .header div {
            text-align: left;
          }
          .header h1 {
            font-size: 24px;
            margin: 0;
          }
          .header p {
            margin: 5px 0;
          }
          .invoice-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .invoice-header div {
            width: 48%;
          }
          .invoice-header h2 {
            font-size: 18px;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            margin-bottom: 20px;
          }
          th, td {
            padding: 8px;
            border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            text-align: left; /* Default left alignment for table cells */
          }
          th {
            background-color: #f2f2f2; /* Light gray background for header */
          }
          .summary-container {
            width: 50%;
            margin-left: auto;
            margin-top: 20px;
            font-size: 18px;
            color: #333;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          .summary-label {
            /* no colon and right indented */
            padding-right: 10px;
            text-align: right;
            flex: 1;
          }
          .summary-value {
            text-align: right;
            flex: 1;
            font-weight: normal;
          }
          .summary-total .summary-label,
          .summary-total .summary-value {
            font-weight: bold;
            font-size: 22px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="../../../assets/images/mawarindah.png" alt="Logo" />
          <div>
            <h1>Toko Kain Mawar Indah</h1>
            <p>Jl. Duren No.18 Gedangan</p>
            <p>Kec. Grogol, Kab. Sukoharjo, Jawa Tengah</p>
            <p>No telp 0821 2516 4123</p>
          </div>
        </div>

        <div class="invoice-header">
          <div>
            <p>Invoice</p>
            <h2># ${transaction.invCode}</h2>
            <p>Customer</p>
            <h2>${transaction.customerName}</h2>
          </div>
          <div style="text-align:right;">
            <p>Tanggal</p>
            <h2>${formattedDate}</h2>
            <p>Waktu</p>
            <h2>${formattedTime}</h2>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40%;">Nama</th>
              <th style="width:20%; text-align:right;">Harga</th>
              <th style="width:10%; text-align:center;">Qty (kg)</th>
              <th style="width:30%; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary-container">
          <div class="summary-row">
            <div class="summary-label">Sub Total</div>
            <div class="summary-value">Rp ${transaction.subTotal.toLocaleString("id-ID")}</div>
          </div>
          <div class="summary-row">
            <div class="summary-label">Total Diskon</div>
            <div class="summary-value">-Rp ${transaction.totalDiscount.toLocaleString("id-ID")}</div>
          </div>
          <div class="summary-row summary-total">
            <div class="summary-label">Total Transaksi</div>
            <div class="summary-value">Rp ${transaction.totalTransaction.toLocaleString("id-ID")}</div>
          </div>
        </div>
      </body>
    </html>
  `

  return html
}

