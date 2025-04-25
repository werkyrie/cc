import { db } from "../lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

async function migrateData() {
  // Get data from localStorage
  const clients = JSON.parse(localStorage.getItem("clients") || "[]")
  const orders = JSON.parse(localStorage.getItem("orders") || "[]")
  const deposits = JSON.parse(localStorage.getItem("deposits") || "[]")
  const withdrawals = JSON.parse(localStorage.getItem("withdrawals") || "[]")
  const orderRequests = JSON.parse(localStorage.getItem("orderRequests") || "[]")

  // Insert clients
  for (const client of clients) {
    await addDoc(collection(db, "clients"), {
      shopId: client.shopId,
      clientName: client.clientName,
      agent: client.agent,
      kycDate: client.kycDate ? new Date(client.kycDate) : null,
      status: client.status,
      notes: client.notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // Insert orders
  for (const order of orders) {
    await addDoc(collection(db, "orders"), {
      orderId: order.orderId,
      shopId: order.shopId,
      clientName: order.clientName,
      agent: order.agent,
      date: order.date ? new Date(order.date) : new Date(),
      location: order.location,
      price: order.price,
      status: order.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // Insert deposits
  for (const deposit of deposits) {
    await addDoc(collection(db, "deposits"), {
      depositId: deposit.depositId,
      shopId: deposit.shopId,
      clientName: deposit.clientName,
      agent: deposit.agent,
      date: deposit.date ? new Date(deposit.date) : new Date(),
      amount: deposit.amount,
      paymentMode: deposit.paymentMode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // Insert withdrawals
  for (const withdrawal of withdrawals) {
    await addDoc(collection(db, "withdrawals"), {
      withdrawalId: withdrawal.withdrawalId,
      shopId: withdrawal.shopId,
      clientName: withdrawal.clientName,
      agent: withdrawal.agent,
      date: withdrawal.date ? new Date(withdrawal.date) : new Date(),
      amount: withdrawal.amount,
      paymentMode: withdrawal.paymentMode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  // Insert order requests
  for (const request of orderRequests) {
    await addDoc(collection(db, "orderRequests"), {
      shopId: request.shopId,
      clientName: request.clientName,
      agent: request.agent,
      date: request.date ? new Date(request.date) : new Date(),
      location: request.location,
      price: request.price,
      status: request.status,
      remarks: request.remarks || "",
      createdAt: new Date(request.createdAt),
      updatedAt: serverTimestamp(),
    })
  }

  console.log("Migration completed")
}

// Run the migration
migrateData()
