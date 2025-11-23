const sendMessage = (message, res) =>
  res.status(200).json({ status: 'success', message });

export default sendMessage;
