module.exports = {
  "Init Clock" : function (browser) {
    browser
      .url("http://localhost:8080/")
      .waitForElementVisible('body', 1000)
      .pause(1000)
      .end();
  }
};
