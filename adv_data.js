"use strict";

let stemmer = require('./stemmer.js').st;

let adv_t = class {
    constructor() {
        this.picture_file = '';
        this.words = [];
    }
};

let strings = `1.png; планшет компьютер электроника интернет технологии игры устройство гаджет
2.png; стена блок строительство пеноблок стройка соединение кирпич
3.png; банк переводы перевод деньги денежный
4.png; свет светодиод светодиодный лампа энергия экономия
5.png; окна двери окно дверь пвх арочный арка
6.png; очки увеличение лупа зрение zoom технологии гаджет`.split('\n');

let advs = [];

for (let i = 0; i < strings.length; i++) {
	let stm = new stemmer();
	advs[i] = new adv_t();
	let str = strings[i].split(';');
	advs[i].picture_file = str[0];
	let wrd = stm.tokenizeAndStem(str[1]);
	let k = 0;
	for (let value of wrd) {
		advs[i].words[k] = value;
		k++;
	}
	/*console.log(advs[i].picture_file);
	for (let j = 0; j < advs[i].words.length; j++) {
		console.log(advs[i].words[j]);
	}*/
}

module.exports = advs;