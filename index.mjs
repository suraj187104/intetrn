import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Solana JSON RPC API endpoint
const SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';

// Wallet address for which to fetch transactions
const WALLET_ADDRESS = '4UYjrT5hmMTh9pLFg1Mxh49besnAeCc23qFoZc6WnQkK';

app.get('/transactions', async (req, res) => {
  try {
    const response = await fetch(SOLANA_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getConfirmedSignaturesForAddress2',
        params: [WALLET_ADDRESS, { limit: 100 }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const transactions = await Promise.all(
      data.result.map(async (tx) => {
        const txResponse = await fetch(SOLANA_RPC_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getConfirmedTransaction',
            params: [tx.signature]
          })
        });

        const txData = await txResponse.json();

        if (txData.error) {
          return null;
        }

        return txData.result;
      })
    );

    res.json(transactions.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});