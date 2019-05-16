#The React of Wall Street
Code Fellows 301 Final Project

##Team Members
• Reina
• Robert
• Vinh
• Luke

##Project Description
The React of Wall Street is a tool that helps you look at the state of the various indexes of US markets and gives you some tools to decide what potential investments you could make. You can also make a portfolio of stocks you want to keep an eye on or have already invested in.

##Problem Domain
People are always looking for a better way to determine what to invest in. There are countless tools out there to aid in making this determination.  Our tool offers a clean and concise way to keep track of the market, news, and stocks of interest.<br />  

As we began thinking through the problem more thoroughly we realized a tool such as ours could be expanded to cover more than just the US market (for example the Hong Kong stock exchange). 

##User Stories
• As a user, I want to see a homepage that is easily understood and interacting with it is intuitive.<br />  
• As a user, I want to see a navigation bar on the homepage, so that I can navigate to the different pages within the website.<br />  
• As a user, I want to be able to see that state of the markets worldwide from the homepage.<br /> 
• As a user, I want to be able to search for stocks based on the company name or their ticker.<br />  
• As a user, on the specific stock’s page, I would like to be able to see all of the pertinent information that I would need to make a good investment decision.<br />  
• As a user, I would like an advanced search option where I could search based on categories of stocks (i.e. risk level, price range, small or large cap, etc.)<br />  
• As a user, I would like to make a portfolio of either stocks I own, or stocks on my watch list.<br />  
• As a user, I would like to see up to date information on the individual stocks (when the market is open, possibly after hours).<br />  
• As a user, I would like to be able to edit my portfolio, add and delete.<br />  
• As a user, I would like to be able to log in and out to see my portfolio.<br />  
• As a user, I would like to query historical data to see hypothetically how much I could have made if I invested in the past (stretch).<br />  

##Installing our App
If you want to install your own backend: <br /> 
Clone the Repo available at: https://github.com/teamnone-finance/301-BackEnd<br />
npm install<br />
set up Postgres<br />
Nodemon<br />

##APIs
We used the Investors Exchange API to get all the data needed for individual stocks and data to supply for the charts. <br />
Endpoint: "https://investors-exchange-iex-trading.p.rapidapi.com/stock/aapl/quote" <br />  

Sample:<br /> 
{40 items<br /> 
"symbol":"AAPL"<br /> 
"companyName":"Apple Inc."<br /> 
"primaryExchange":"Nasdaq Global Select"<br /> 
"sector":"Technology"<br /> 
"calculationPrice":"close"<br /> 
"open":186.27<br /> 
"openTime":1557927000361<br /> 
"close":190.92<br /> 
"closeTime":1557950400686<br /> 
"high":191.75<br /> 
"low":186.02<br /> 
"latestPrice":190.92<br /> 
"latestSource":"Close"<br /> 
"latestTime":"May 15, 2019"<br /> 
"latestUpdate":1557950400686<br /> 
"latestVolume":26010088<br /> 
"iexRealtimePrice":191.03<br /> 
"iexRealtimeSize":100<br /> 
"iexLastUpdated":1557950399821<br /> 
"delayedPrice":190.92<br /> 
"delayedPriceTime":1557950400686<br /> 
"extendedPrice":190.51<br /> 
"extendedChange":-0.41<br /> 
"extendedChangePercent":-0.00215<br /> 
"extendedPriceTime":1557953999270<br /> 
"previousClose":188.66<br /> 
"change":2.26<br /> 
"changePercent":0.01198<br /> 
"iexMarketPercent":0.03519<br /> 
"iexVolume":915295<br /> 
"avgTotalVolume":28736911<br /> 
"iexBidPrice":0<br /> 
"iexBidSize":0<br /> 
"iexAskPrice":0<br /> 
"iexAskSize":0<br /> 
"marketCap":878437239000<br /> 
"peRatio":15.7<br /> 
"week52High":233.47<br /> 
"week52Low":142<br /> 
"ytdChange":0.2163800886095262<br /> 
}<br /> 

Endpoint: "https://investors-exchange-iex-trading.p.rapidapi.com/stock/aapl/chart/3m"<br /> 
Sample: <br /> 
{12 items<br /> 
"date":"2019-02-13"<br /> 
"open":170.7325<br /> 
"high":171.8184<br /> 
"low":169.2682<br /> 
"close":169.5272<br /> 
"volume":22490233<br /> 
"unadjustedVolume":22490233<br /> 
"change":-0.707276<br /> 
"changePercent":-0.415<br /> 
"vwap":170.3478<br /> 
"label":"Feb 13, 19"<br /> 
"changeOverTime":0<br /> 
}<br /> 

News Endpoint: https://newsapi.org/v2/everything?q=stocks+finance&from=2019-05-15&to=${today}&sortBy=publishedAt&apiKey=${process.env.REACT_APP_GN_API_KEY}<br /> 
Sample: <br />
articles": [
        {
            "source": {
                "id": null,
                "name": "Yahoo.com"
            },
            "author": null,
            "title": "Eagle Materials Inc (EXP) Q4 2019 Earnings Call Transcript",
            "description": "EXP earnings call for the period ending March 31, 2019.",
            "url": "https://finance.yahoo.com/news/eagle-materials-inc-exp-q4-212313325.html",
            "urlToImage": "https://s.yimg.com/uu/api/res/1.2/A8Du5.6Ly4B5n_w5qGj5LQ--~B/aD02MTg7dz01ODA7c209MTthcHBpZD15dGFjaHlvbg--/http://media.zenfs.com/en-US/homerun/motleyfool.com/62a1dc3478a5ad39fe4a591d8100819f",
            "publishedAt": "2019-05-16T21:23:13Z",
            "content": "Image source: The Motley Fool.Eagle Materials Inc (NYSE: EXP)Q4 2019 Earnings CallMay 16, 2019, 8:30 a.m. ETGood day, everyone, and welcome to Eagle Materials' Fiscal 2019 Earnings Conference Call. This call is being recorded.At this time, I would like to tur… [+40298 chars]"
        },```

##Database Schema
```DROP TABLE IF EXISTS users, portfolio, stocks;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  portfolio_name VARCHAR(255),
  description TEXT,
  user_id VARCHAR(255) NOT NULL REFERENCES users(username)
);

CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  stock_symbol VARCHAR(255),
  stock_name VARCHAR(255),
  portfolio_id INTEGER NOT NULL REFERENCES portfolio(id)
);```

##Acknowledgments
John Cokos, tradingview.com, IEX API, NewsAPI.org

##License
This project is licensed under the MIT License - see the LICENSE file for details.
