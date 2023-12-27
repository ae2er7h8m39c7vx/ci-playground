(async () => {
    const { parseString } = require("xml2js");
    const fs = require("node:fs");
    const util = require("node:util");

    let input
    input = await last20Lines()
    input = input.split('\n').slice(0, -1)
    input = input.map((line) => JSON.parse(line))
    input = new Set(input.map((line) => line.link))

    let res
    // res = await fetch("http://rss.lowyat.net/forum/154")
    res = await fetch("http://rss.lowyat.net/topic/2852676")
    res = await res.text()
    res = await util.promisify(parseString)(res)
    res = res.rss.channel[0].item
    res = res.map(each => Object.fromEntries(Object.entries(each).map(([key, val]) => [key, val[0]])))
    res = res.reverse()
    res = res.filter((each) => !input.has(each.link))
    res = res.map((each) => ({ ...each, description: cleanDescription(each.description) }))

    if (res.length) {
        for (const { description, link } of res) await sendWebhook(description + " " + link)
        await util.promisify(fs.appendFile)('2852676', res.map((line) => JSON.stringify(line)).join('\n') + '\n')
    }

    process.exit(0)
})()

async function last20Lines() {
    let input = ""
    process.stdin.on("data", (data) => input += data.toString())
    await new Promise((resolve) => process.stdin.on("end", resolve))
    return input
}

async function sendWebhook(content) {
    await fetch(
        process.env.WEBHOOK_URL,
        {
            method: "POST",
            headers: { ["Content-Type"]: "application/json" },
            body: JSON.stringify({ content })
        }
    )
}

/**
 *
 * @param {string} description
 */
function cleanDescription(description) {
    return description.replace(/<!--.+-->/g, "").replace(/<br \/>/g, '\n')
}
