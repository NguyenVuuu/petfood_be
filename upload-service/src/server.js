const app = require("./app");
const { port } = require("./config/env");

app.listen(port, () => {
  console.log(`upload-service is running on port ${port}`);
});
