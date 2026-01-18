exports.simulateBlockchainTx = () => {
  const fakeTxHash = "0x" + Math.random().toString(16).slice(2, 10) + Date.now();
  const fakeBlockNumber = Math.floor(Math.random() * 100000);
  return { fakeTxHash, fakeBlockNumber };
};
