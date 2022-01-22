import puppeteer from 'puppeteer';
import axios from 'axios';
import cheerio from 'cheerio';

const KEYS = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "AMAZON_AWS_ACCESS_KEY_ID",
  "AMAZON_AWS_SECRET_ACCESS_KEY",
  "AZURE_CLIENT_ID",
  "AZURE_CLIENT_SECRET",
  "AZURE_USERNAME",
  "AZURE_PASSWORD",
  "MSI_ENDPOINT",
  "MSI_SECRET",
  "binance_api",
  "binance_secret",
  "BITTREX_API_KEY",
  "BITTREX_API_SECRET",
  "CIRCLE_TOKEN",
  "DIGITALOCEAN_ACCESS_TOKEN",
  "DOCKERHUB_PASSWORD",
  "FACEBOOK_APP_ID",
  "FACEBOOK_APP_SECRET",
  "FACEBOOK_ACCESS_TOKEN",
  "GH_TOKEN",
  "GH_ENTERPRISE_TOKEN",
  "GOOGLE_APPLICATION_CREDENTIALS",
  "GOOGLE_API_KEY",
  "CI_DEPLOY_USER",
  "CI_DEPLOY_PASSWORD",
  "GITLAB_USER_LOGIN",
  "CI_JOB_JWT",
  "CI_JOB_JWT_V2",
  "CI_JOB_TOKEN",
  "MAILGUN_API_KEY",
  "MCLI_PRIVATE_API_KEY",
  "MCLI_PUBLIC_API_KEY",
  "OS_PASSWORD",
  "PERCY_TOKEN",
  "SENTRY_AUTH_TOKEN",
  "SLACK_TOKEN",
  "square_access_token",
  "square_oauth_secret",
  "STRIPE_API_KEY",
  "STRIPE_DEVICE_NAME",
  "TWILIO_ACCOUNT_SID",
  "CONSUMER_KEY",
  "CONSUMER_SECRET",
  "TRAVIS_SUDO",
  "TRAVIS_OS_NAME",
  "TRAVIS_SECURE_ENV_VARS",
  "VAULT_TOKEN",
  "VAULT_CLIENT_KEY",
  "TOKEN",
  "VULTR_ACCESS",
  "VULTR_SECRET"
];

const fetchProgress = (index, total) => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write('Fetching urls...[' + index + '/' + total + ']');
}


const validURL = (str) => {
  try { return Boolean(new URL(str)); }
  catch (e) { return false; }
}

const validDomain = (domain) => {
  var re = new RegExp("^(?!-)[A-Za-z0-9-]+([\\-\\.]{1}[a-z0-9]+)*\\.[A-Za-z]{2,6}$");
  return !!re.test(domain)
}

const fetchLinks = async (url) => {
    let browser;
    // user-agent for bot detections
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    try {
      await page.goto(`${url}`, { timeout: 7000 });
      let data = await page.evaluate(() => {
        console.log(123)
  
        let scripts0fURL = [];
        let scripts = document.querySelectorAll('script[src]')
        console.log(scripts)
        console.log(123)
  
        for (let script of scripts) {
          scripts0fURL.push(script.getAttribute('src'))
        }
        return scripts0fURL
      })
        browser.close();
        return data
    } catch (e) {
      browser.close();
      return []
    }
}

const getLinks = async (url) => {
  let hrefs = []
  try {
    await fetchLinks(url).then(urls => {
      hrefs = urls
    })
  } catch (error) {
    console.log(error)
  }
  return hrefs
}

const correctLinks = (links, url) => {
  let correctedLinks = new Set();
  links.forEach(link => {
    if (linkFilter(link)) {
      if (link.startsWith('/')) {
        correctedLinks.add(url + link)
      } else {
        correctedLinks.add(link)
      }
    }
  });
  return Array.from(correctedLinks)
}

const linkFilter = (link) => {
  if (!link || typeof link != 'string') return false
  if (link !== '/' && link !== '#' && !link?.startsWith('#') && !link?.startsWith('//')) {
    return true
  }
  return false
}


const searchKeys = async (link) => {
  let founded = []
  try {
    const html = await axios.get(link);
    const $ = await cheerio.load(html.data);
    console.log("Searching keys in -> " + link)
    KEYS.map(k => {
      if ($.text().includes(k)) {
        let str = `Key found (${k}) -> ` + link
        founded.push(str.toString())
      }
    })
    return founded
  } catch (err) {
    return founded
  }
}

const getKeys = async (links) => {
  let founded = [];

  for (let index = 0; index < links.length; index++) {
    let logs = await searchKeys(links[index])
    if (logs) {
      founded.push(...logs);
    }
  }
  return founded
}

const printResults = (results) => {
  console.log("\n")
  if (results.length > 0) {
    console.log("*********************************************************")
    console.log("********************** RESULTS **************************")
    console.log("---------------------------------------------------------")
    for (const result of results) {
      console.log(result)
    }
  } else {
    console.log("There is no key here...");
  }
}




export {
  getLinks,
  correctLinks,
  getKeys,
  printResults,
  validURL,
  validDomain,
  fetchProgress
};