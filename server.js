require('dotenv').config()
```

Then create a `.gitignore` file and put this in it:
```
node_modules
.env

const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json())

// paste your real values here
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
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

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running')
})