
export async function analyzeStock(query) {
  const response = await fetch(
    "https://endpoint--stocksense--ksxg2vxqsywy.code.run/getstocksentiment",
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
    console.log(data.error);
    throw new Error(`API Error: ${data.error}`);
  }

  return data;
}


export async function getData(query) {
  const response = await fetch("https://endpoint--stocksense--ksxg2vxqsywy.code.run/getstockdata", {
    method: 'POST',
    body: new URLSearchParams({ stock_symbol: query }),
  });
  if (!response.ok) throw new Error('Server error');
  return response.json();
}


export async function predictStock(query) {
  const response = await fetch(
    "https://endpoint--stocksense--ksxg2vxqsywy.code.run/predict",
    {
      method: "POST",
      body: new URLSearchParams({ stock_symbol: query }),
    }
  );

  if (!response.ok) {
    throw new Error("Predction error");
  }

  const data = await response.json();

  // Check if the response contains an error field
  if (data.error) {
    console.log(data.error);
    throw new Error(`API Error: ${data.error}`);
  }

  return data;
}

// export async function train(query) {
// 	const client = await Client.connect("MLSpeech/StockSenseSpace");
// 	const result = await client.predict("/train", { 		
// 			symbol: query, 		
// 			//seq_len: 3, 		
// 			//epochs: 3, 		
// 			//batch_size: 3, 		
// 			//start: "Hello!!", 		
// 			//end: "Hello!!", 
// 	});
//   return result.data;
// }

// export async function test(query) {
// 	const client = await Client.connect("MLSpeech/StockSenseSpace");
// 	const result = await client.predict("/test", { 		
// 			symbol: query, 
// 	});
//   return result.data;
// }

// export async function predict(query) {
// 	const client = await Client.connect("MLSpeech/StockSenseSpace", {
//   token: "-"
//   });
// 	const result = await client.predict("/predict", { 		
// 			symbol: query, 		
// 			//days: 1, 
// 	});
//   return result.data;
// }
