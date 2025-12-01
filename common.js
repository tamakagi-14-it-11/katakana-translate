//定数の宣言
const apiUrl = "https://api.tkg14it11.f5.si/api2/";

//変数の宣言
let dictionaryList = [];
let dictionaryIndex = 0;
let dictionaryData = {};
let dictionaryDataKeys = [];

//イベントの作成
const dictionaryListLoadedEvent = new Event("dictionaryListLoaded");
const dictionaryDataLoadedEvent = new Event("dictionaryDataLoaded");

//辞書リストの読み込み
async function getDictionaryList() {
	console.log("getDictionaryList");
	const url = "../data/dictionary_list.json";
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`レスポンスステータス: ${response.status}`);
		}
		const json = await response.json();
		dictionaryList = json;
		console.log("loaded dictionaryList:", dictionaryList);
		document.dispatchEvent(dictionaryListLoadedEvent);
	} catch (error) {
		console.error(error.message);
	}
}

//辞書データの読み込み
async function getDictionaryData() {
	console.log("getDictionaryData");
	dictionaryData = [];
	dictionaryDataKeys = [];
	for (let i = 0; i < dictionaryList[dictionaryIndex].data.length; i++) {
		const url = "../data/" + dictionaryList[dictionaryIndex].data[i].fileName;
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`レスポンスステータス: ${response.status}`);
			}
			await extractData(
				response,
				dictionaryList[dictionaryIndex].data[i].contentType,
				dictionaryList[dictionaryIndex].data[i].name
			);
			console.log("loaded dictionaryData:", dictionaryData);
		} catch (error) {
			console.error(error.message);
		}
	}
	// ユーザー辞書の読み込み
	if (localStorage.dicData) {
		let userDicData = JSON.parse(localStorage.dicData);
		userDicData.forEach((item) => {
			if (!dictionaryData[item.word]) {
				dictionaryData[item.word] = [];
			}
			dictionaryData[item.word].push({ mean: item.mean, type: "User Dictionary" });
			console.log(item.word, item.mean);
		});
	}
	dictionaryDataKeys = Object.keys(dictionaryData);
	console.log("finished getDictionaryData");
	document.dispatchEvent(dictionaryDataLoadedEvent);
}

async function extractData(response, contentType, type) {
	if (contentType == "application/json") {
		const json = await response.json();
		//使用するデータのみを抽出
		for (let i = 0; i < json.length; i++) {
			const means = json[i][1].split("//");
			for (let j = 0; j < means.length; j++) {
				if (!dictionaryData[json[i][0]]) {
					dictionaryData[json[i][0]] = [];
				}
				dictionaryData[json[i][0]].push({ mean: means[j], type: type });
			}
		}
	} else if (contentType == "text/csv") {
		const text = await response.text();
		const lines = text.split(/\r\n|\n|\r/);
		lines.splice(0, 1); //ヘッダー行を削除
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].split(",");
			// 一行目をはスキップ
			if (line.length < 2) {
				continue;
			}
			const means = line[1].split("//");
			for (let j = 0; j < means.length; j++) {
				if (!dictionaryData[line[0]]) {
					dictionaryData[line[0]] = [];
				}
				dictionaryData[line[0]].push({ mean: means[j], type: type });
			}
		}
	} else {
		throw new Error(`未対応のファイル形式です:` + contentType);
	}
}

//辞書データを使用して変換
function changeWord(text) {
	let result = [
		{
			text: text,
			type: "original",
		},
	];
	dictionaryDataKeys.forEach(function (word) {
		if (text.indexOf(word) != -1) {
			for (let i = 0; i < result.length; i++) {
				if (i >= 10) {
					break;
				}
				if (result[i].type == "original") {
					let splitted = result[i].text.split(word);
					let changed = [];
					changed.push({
						text: splitted[0],
						type: "original",
					});
					for (let j = 1; j < splitted.length; j++) {
						changed.push({
							text: dictionaryData[word][0].mean,
							type: "changed",
							original: word,
						});
						changed.push({
							text: splitted[j],
							type: "original",
						});
					}
					changed = changed.filter((e) => e.text !== "");
					result.splice(i, 1, ...changed);
					i += changed.length - 1; // 新しい要素の数だけインデックスを進める
				}
			}
			// result = result.replaceAll(
			// 	word,
			// 	`<span class="changed-word" data-original="${word}">${dictionaryData[word][0].mean}</span>`
			// );
		}
	});
	// console.log("result:", result);
	return convertResultArrayToHTML(result);
}

function convertResultArrayToHTML(result) {
	if (typeof result === "string") {
		// 文字列が渡された場合はそのまま返す
		return result;
	}
	let resultText = "";
	result.forEach((element) => {
		if (element.type == "original") {
			resultText += element.text;
		} else if (element.type == "changed") {
			resultText += `<span class="changed-word" data-original="${element.original}">${element.text}</span>`;
		}
	});
	return resultText;
}

// 辞書から検索
function searchWord(word) {
	if (dictionaryData[word]) {
		return dictionaryData[word];
	} else {
		return word;
	}
}

// chatGPTを使用して変換
async function changeWordWithChatGPT(text) {
	const url = apiUrl;

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ text: text }),
		});
		if (!response.ok) {
			throw new Error(`レスポンスステータス: ${response.status}`);
		}
		const json = await response.json();
		if (!json.status) {
			throw new Error(`no response status`);
		} else if (json.status != "success") {
			throw new Error(`APIエラー: ${json.status} : ${json.message}`);
		}
		// return json.data;
		return convertResultArrayToHTML(json.data);
	} catch (error) {
		console.error("chatGPT変換エラー:", error.message);
		return text; // エラーが発生した場合は元のテキストを返す
	}
}

//weblio類語検索
function searchSynonymByWeblio(word) {
	const url = `https://thesaurus.weblio.jp/content/${word}`;
	console.log("url:", url);
	window.open(url, "_blank");
}

//weblio類語から類語を取得
function getSynonymFromWeblio(word) {
	const url = `https://script.google.com/macros/s/AKfycbwFgACr5iqBSTL8Rb_PjiJi2VwcYOLCFCIeNrMWXf_qJ3eLKmevAgbVCjgfFQnTnheMuw/exec?data=${word}`;
	console.log("url:", url);
	fetch(url)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`レスポンスステータス: ${response.status}`);
			}
			return response.json();
		})
		.then((json) => {
			// console.log("json:", json);
			if (json.status != "success") {
				throw new Error(`json.status: ${json.status}`);
			}
			if (json.data.length == 0) {
				console.log("類語が見つかりませんでした");
			} else {
				console.log("synonym:", json.data);
			}
			return json;
		})
		.catch((error) => {
			console.error(error.message);
		});
}

//デバッグ用
function testChangeWordWithChatGPT(text) {
	changeWordWithChatGPT(text)
		.then((result) => {
			console.log("変換後テキスト:", result);
		})
		.catch((error) => {
			console.error(error.message);
		});
}

//読み上げの設定
let voices = [];
const speechSynthesis = window.speechSynthesis;
speechSynthesis.onvoiceschanged = (e) => {
	voices = speechSynthesis.getVoices();
};
const utter = new SpeechSynthesisUtterance();
utter.lang = "ja-JP";

function speak(text) {
	if (voices.length == 0) {
		// console.error("音声合成エラー: 音声データが読み込まれていません");
		// return;
	} else if (voices.length < 4) {
		utter.voice = voices[0];
	} else {
		utter.voice = voices[3];
	}
	utter.volume = 1;
	utter.text = text;
	speechSynthesis.speak(utter);
}
