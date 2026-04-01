const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json())

// paste your real values here
const supabase = createClient(
  'https://zidlsqxizqjkovgfpwkw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppZGxzcXhpenFqa292Z2Zwd2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNDk3MDgsImV4cCI6MjA5MDYyNTcwOH0.0LQnzgfAoVCybYD6VWMrGDwDGs3E9kDMv8fz0NpSQnw'
)

app.get('/', (req, res) => {
  res.json({ message: 'QR Pay server is running' })
})

app.post('/api/payment', async (req, res) => {
  const { amount, shop } = req.body

  if (!amount || !shop) {
    return res.status(400).json({ error: 'Amount and shop are required' })
  }

  const cashback = amount * 0.005

  // save to database
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      shop_name: shop,
      amount: amount,
      cashback: cashback,
      status: 'pending'
    })
    .select()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  console.log(`Payment saved: Rs. ${amount} for ${shop}`)

  res.json({
    success: true,
    transaction_id: data[0].id,
    message: `Payment of Rs. ${amount} received`,
    cashback: cashback
  })
})

app.get('/api/transactions', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.json(data)
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})