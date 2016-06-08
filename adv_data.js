"use strict";

let stemmer = require('./stemmer.js').st;

let adv_t = class {
    constructor() {
        this.picture_file = '';
        this.link = '';
        this.words = [];
    }
};

let strings = `1.png; планшет компьютер электроника интернет технологии игры устройство гаджет;shop.megafon.ru
2.png; стена блок строительство пеноблок стройка соединение кирпич;kirpichbloki.ru
3.png; банк переводы перевод деньги денежный;www.westernunion.ru
4.png; свет светодиод светодиодный лампа энергия экономия;755700.ru
5.png; окна окно двери дверь окно дверь пвх арочный арка;oknastar.ru
6.png; очки увеличение лупа зрение zoom технологии гаджет;best-present-for-you.com
7.png; отделка балкон лоджия утепление тепло отопление окно окна;oknastar.ru
8.png; жилой комплекс нахабино ясное комфорт жилье тишина;yanahabino.ru
9.png; катание туризм танк боевой экстрим подарок;happiness-shop.ru
10.png; радиатор дизайн интерьер дом;rythm.ru
11.png; типография баннер штендер стенд;9703420.ru
12.png; плод ягода питомник сад культура;sadograd.ru
13.png; счёт форекс брокер торговля биржа;fxpro.ru
14.png; зарядка портативный устройство аккумулятор зарядное;vnoutbuke.ru
15.png; скидка товары;westhouz.ru
16.png; тур теплоход прогулка река экскурсия рыбалка;magput.ru
18.png; кот кошка котенок питание корм;afina-pet.ru
19.png; 1с отчетность отчет документы документация офис;bs.1cfresh.com`.split('\n');

let advs = [];

for (let i = 0; i < strings.length; i++) {
	let stm = new stemmer();
	advs[i] = new adv_t();
	let str = strings[i].split(';');
	advs[i].picture_file = str[0];
	advs[i].link = str[2];
	let wrd = stm.tokenizeAndStem(str[1]);
	let k = 0;
	for (let value of wrd) {
		advs[i].words[k] = value;
		k++;
	}
}

module.exports = advs;