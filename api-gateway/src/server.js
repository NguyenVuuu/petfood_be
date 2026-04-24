const app = require("./app");
const { port } = require("./config/env");

app.listen(port, () => {
  console.log(`api-gateway is running on port ${port}`);
});
