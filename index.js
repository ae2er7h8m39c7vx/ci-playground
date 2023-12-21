(async () => {
    const res = await fetch(
        process.env.WEBHOOK_URL,
        {
            method: "POST",
            headers: { ["Content-Type"]: "application/json" },
            body: JSON.stringify({ content: "Hello from github workflow" })
        }
    )
    const x = await res.text()
    process.exit(0)
})()
