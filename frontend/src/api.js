
export async function analyzeStock(query) {
  const response = await fetch(
    "https://stocksense-3oql.onrender.com/getstocksentiment",
    {
      method: "POST",
      body: new URLSearchParams({ stock_symbol: query }),
    }
  );

  if (!response.ok) {
    throw new Error("Server error");
  }

  const data = await response.json();

  // Check if the response contains an error field
  if (data.error) {
    throw new Error(`API Error: ${data.error}`);
  }

  return data;
}


export async function getData(query) {
  const response = await fetch("https://stocksense-3oql.onrender.com/getstockdata", {
    method: 'POST',
    body: new URLSearchParams({ stock_symbol: query }),
  });
  if (!response.ok) throw new Error('Server error');
  return response.json();
}

