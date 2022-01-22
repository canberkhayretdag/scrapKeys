import {
    getLinks,
    correctLinks,
    getKeys,
    printResults,
    validURL,
    validDomain,
    fetchProgress
} from './utils.js'
import fs from 'fs';
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
const yargs = _yargs(hideBin(process.argv));


function readFile(filename) {
    const data = fs.readFileSync(filename, 'utf8').split('\n');
    return data
}

function main() {
    const args = yargs.argv;
    let urls = readFile(args.file);
    let links = []
    for (let url of urls) {
        let temp = url.replace('\r', '')
        if (validDomain(temp) || validURL(temp)) {
            if (!(temp.startsWith('http://') || temp.startsWith('https://'))) {
                temp = 'https://' + temp
            }
            links.push(temp)
        } else {
            console.log("\n")
            console.log("Domain fomat is invalid -> passed: " + temp);
        }
    }
    urls = links
    console.log("\n")
    const promise__getlinks = new Promise(async (resolve, reject) => {
        let correctedLinks = [];
        let fetchedLinks = [];
        let len = urls.length;
        for (let index = 0; index < len; index++) {
            fetchProgress(index+1,len);
            fetchedLinks.push(...(await getLinks(urls[index])))
            correctedLinks.push(...(await correctLinks(fetchedLinks, urls[index])));
        }
        correctedLinks = [...new Set(correctedLinks)]
        resolve(correctedLinks)
    });

    promise__getlinks.then(async (correctedLinks) => {
        console.log('\n')
        console.log('-----------------------------')
        let results = await getKeys(correctedLinks);
        printResults(results)
    });



}

main()