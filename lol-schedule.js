class Api {
    async getSchedule() {
        const res = await fetch("https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=98767991299243165%2C98767991310872058", {
            headers: { "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z" }
        })
        const json = await res.json()
        return json
    }
}

class Helper {
    /**
     *
     * @param {Date} date
     */
    matchIsLive(date) {
        const eightMinutesLater = new Date()
        eightMinutesLater.setMinutes(eightMinutesLater.getMinutes() - 8) // NOTE: CI runs every 5 minutes or so

        const now = new Date()


        return eightMinutesLater <= date && date <= now
    }
}

class Slack {
    /**
     *
     * @param {string} content
     */
    async sendWebhook(content) {
        await fetch(
            process.env.WEBHOOK_URL,
            {
                method: "POST",
                headers: { ["Content-Type"]: "application/json" },
                body: JSON.stringify({ content })
            }
        )
    }
}

class Script {
    async main() {
        const api = new Api()
        const helper = new Helper()
        const slack = new Slack()
        const schedule = await api.getSchedule()

        for (const event of schedule.data.schedule.events) {
            if (event.state === "completed") continue

            const teams = new Set(event.match.teams.map(team => team.code))
            if (!teams.has("T1")) continue

            const startTime = new Date(event.startTime)
            if (!helper.matchIsLive(startTime)) continue

            const content = [...teams].join(" vs ")
            slack.sendWebhook(content + " 🚀")
        }
    }
}

new Script().main()
