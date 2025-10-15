
export async function analyzeStock(query) {
  const response = await fetch("https://stocksense-3oql.onrender.com/getstocksentiment", {
    method: 'POST',
    body: new URLSearchParams({ stock_symbol: query }),
  });
  if (!response.ok) throw new Error('Server error');
  return response.json();
}

export async function getData(query) {
  const response = await fetch("https://stocksense-3oql.onrender.com/getstockdata", {
    method: 'POST',
    body: new URLSearchParams({ stock_symbol: query }),
  });
  if (!response.ok) throw new Error('Server error');
  return response.json();
}

