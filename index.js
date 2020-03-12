import express from "express";
import dotenv from "dotenv";
import btoa from "btoa";
import "isomorphic-fetch";

dotenv.config();

const { TOGGL_TOKEN } = process.env;

const port = process.env.PORT || 8181;
const app = express();

const headers = {
	Authorization: "Basic " + btoa(`${TOGGL_TOKEN}:api_token`)
};

app.get("/stop", async (req, res) => {
	const current = await fetch(
		"https://www.toggl.com/api/v8/time_entries/current",
		{
			headers
		}
	);

	if (!current.ok) {
		res.send({ message: "Current: API error" });
	}

	const curr = await current.json();
	const { data } = curr;

	if (data === null) {
		res.status(204).send();
	}

	const { id: currentId } = data;

	if (currentId) {
		await fetch(`https://www.toggl.com/api/v8/time_entries/${currentId}/stop`, {
			method: "PUT",
			headers
		});
	}

	res.send({ message: "Toggl stopped!" });
});

app.get("/start/:project", async (req, res) => {
	const { project } = req.params;

	const response = await fetch(
		"https://www.toggl.com/api/v8/time_entries/start",
		{
			method: "POST",
			headers,
			body: JSON.stringify({
				time_entry: {
					description: "Tracked from Flic",
					pid: project,
					created_with: "flic"
				}
			})
		}
	);

	if (!response.ok) {
		res.status(400).send({ message: "Start: API error" });
	}

	res.send({ message: "Toggl started!" });
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
