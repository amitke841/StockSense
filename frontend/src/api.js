export async function analyzeStock(query) {
  try {
    const response = await fetch("https://stocksense-3oql.onrender.com/getstocksentiment", {
      method: 'POST',
      body: new URLSearchParams({ stock_symbol: query }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
    return response.json();
  } catch (error) {
    console.error("Error in analyzeStock:", error);
    throw error;
  }
}

export async function getData(query) {
  try {
    const response = await fetch("https://stocksense-3oql.onrender.com/getstockdata", {
      method: 'POST',
      body: new URLSearchParams({ stock_symbol: query }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
    return response.json();
  } catch (error) {
    console.error("Error in getData:", error);
    throw error;
  }
}

