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
      second: "numeric",
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
        <tr style="border-bottom:1px solid #ddd;">
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
            margin-bottom: 20px;
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
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
          }
          th {
            background-color: #457b9d;
            color: white;
          }
          .total {
            font-weight: bold;
            font-size: 16px;
            text-align: right;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Toko Kain Mawar Indah</h1>
          <p>Jl. Duren No.18 Gedangan</p>
          <p>Kec. Grogol, Kab. Sukoharjo, Jawa Tengah</p>
          <p>No telp 0821 2516 4123</p>
        </div>

        <div class="invoice-header">
          <div>
            <h2>Invoice</h2>
            <p>#: ${transaction.invCode}</p>
            <p>Customer: ${transaction.customerName}</p>
          </div>
          <div>
            <h2>Tanggal</h2>
            <p>${formattedDate}</p>
            <h2>Waktu</h2>
            <p>${formattedTime}</p>
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

        <p class="total">Total Transaksi: Rp ${transaction.totalTransaction.toLocaleString(
          "id-ID"
        )}</p>
      </body>
    </html>
  `

  return html
}
