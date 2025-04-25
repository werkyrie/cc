import { NextResponse } from "next/server"
import { db, auth } from "@/lib/firebase"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"

export async function GET() {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch clients from Firebase
    const clientsSnapshot = await getDocs(collection(db, "clients"))
    const clients = clientsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get client data from request
    const client = await request.json()

    // Add client to Firebase
    const docRef = await addDoc(collection(db, "clients"), {
      shopId: client.shopId,
      clientName: client.clientName,
      agent: client.agent,
      kycDate: client.kycDate ? new Date(client.kycDate) : null,
      status: client.status || "In Process",
      notes: client.notes || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return NextResponse.json({
      id: docRef.id,
      ...client,
    })
  } catch (error) {
    console.error("Error adding client:", error)
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 })
  }
}
