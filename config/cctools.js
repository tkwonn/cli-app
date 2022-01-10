export const ConfigCCTools = {
  validCommandList: ["showAvailableLocales", "showDenominations", "convert"],
  zeroArgumentCommand: ["showAvailableLocales"],
  singleArgumentCommand: ["showDenominations"],
  tripleArgumentsCommand: ["convert"],
  validCurrencyList: [
    {
      locale: "India",
      denomination: "Rupee",
      exchangeRateJPY: 1.442,
    },
    {
      locale: "India",
      denomination: "Paisa",
      exchangeRateJPY: 0.014442,
    },
    {
      locale: "USA",
      denomination: "Dollar",
      exchangeRateJPY: 106.10,
    },
    {
      locale: "USA",
      denomination: "USCent",
      exchangeRateJPY: 1.0610,
    },
    {
      locale: "Europe",
      denomination: "Euro",
      exchangeRateJPY: 125.56,
    },
    {
      locale: "Europe",
      denomination: "EuroCent",
      exchangeRateJPY: 1.2556,
    },
    {
      locale: "UAE",
      denomination: "Dirham",
      exchangeRateJPY: 28.89,
    },
    {
      locale: "UAE",
      denomination: "Fils",
      exchangeRateJPY: 0.2889
    }
  ],
}