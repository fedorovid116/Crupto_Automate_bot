//////////////////////////////////////////////////////////////////////////////
// инструкция-мануал https://teletype.in/@satoshi_brothers/dolphin_antidetect_abuse_like_a_PRO
// ( ! ) разрешаю использование кода в любых, только законных, целях.
// ( ! ) разрешаю копировать статью, код, изменять код, делиться программой/статьёй в других местах - 
// - только с указанием контакта моего ТГ канала ( https://t.me/satoshi_brothers )
// там-же вы сможете получить поддержу по работе скрипта.
//////////////////////////////////////////////////////////////////////////////

const puppeteer = require('puppeteer-extra');
var sleep = require('system-sleep');
puppeteer.use(require('puppeteer-extra-plugin-repl')())
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const repl = require('puppeteer-extra-plugin-repl');
const axios = require('axios');

const fs = require('fs');
const readFileLines = filename => fs.readFileSync(filename).toString('UTF8').split('\n');
let browser_full_id = readFileLines('browser.ids.txt');

var iznachalnoye_kolichestvo_zaprashyvaemyhBrausers; //переменная для памяти количества завершенных задач (браузеров)
var count_opened_browsers = 0;
var countFinishedBrowsers = 0;
var count_CLOSED_Browsers = 0;
var tblrMakeLaunchPause = 1;
var last_time_IP_changed = new Date().getTime() / 1000;
var twiusArr = [];
var twius_namesArr = [];
var host = "localhost";


// нужно ли сменять IP (ротировать) ? 
var isRotationNeeded = 0;
// 1 - да. (в случае если ты пользуешься мобильными(или другими) ротируещемися проксями)
// 0 - нет. (в случае если для каждого слепка у тебя разный cocks/http прокси)

// ссылка для смены IP (ротации) //
var rotationLink = "http://...."

// переходить к следующему браузеру:
var close_type = 0;
// 0 - сразу (подождав ip_change_interval секунд) - стандартное значение.
// 1 - с паузой 55 секунд - в случае работы с прокси, ротация которых происходит через определённый момент времени. Минута, две, пять, ...  
// если 1, тогда timewaitInCaseAutoRotationProxyes равен количеству секунд, сколько нужно подождать пока ип сменится сам на новый
var timewaitInCaseAutoRotationProxyes = 60;

// интервал смены IP в секундах. (минимальное время между сменой IP. Если слишком быстро 'дергать' ссылку, модем может поломаться и выключиться.) 
var ip_change_interval = 30;


function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}
// получение аргумента при запуске программы
var nomerBrawser_arg = process.argv.slice(5);
var programma = JSON.stringify(process.argv[3]).slice(1, -1);
var opened_browInOneTimeLimit = parseInt(JSON.stringify(process.argv[2]).slice(1, -1)) - 1;

// handler запущенных/закрытых браузеров
openedAndClosedBrowsers_handler()
async function openedAndClosedBrowsers_handler() {
  iz = 0
  while (iz < 100000) {
    //console.log("итерация хендлера браузеров онлайн!!!")
    if ((count_opened_browsers - countFinishedBrowsers) > opened_browInOneTimeLimit) {
      //console.log("ПОДАНО БОЛЬШЕ [сколькото] ЗАПРОСОВ НА ОТКРЫТИЕ!!!")
      tblrMakeLaunchPause = 1;
    } else {
      tblrMakeLaunchPause = 0;
    }
    await delay(500);
    iz++;
  }
}

//ЦИКЛ перебора и запуска подключений
var firstloop_is = 0;
cycle();
function cycle() {
  if (!(JSON.stringify(nomerBrawser_arg).includes("-"))) { // проверяю на наличие диапазона в аргументах
    open_it_func()
  } else {
    var nomerBrawser_argDiapason = (JSON.stringify(nomerBrawser_arg).slice(2, -2)).split("-")
    // сортирую по возрастанию // готовлю диапазон в массив для запуска
    nomerBrawser_argDiapason.sort(function compareNumbers(a, b) { return a - b; })
    result = Math.abs(nomerBrawser_argDiapason[1]) - Math.abs(nomerBrawser_argDiapason[0])
    var num = 0;
    for (let x = 1; x != result; x++) {
      nomerBrawser_argDiapason.push(Math.abs(nomerBrawser_argDiapason[0]) + x)
    }
    nomerBrawser_argDiapason.sort(function compareNumbers(a, b) { return a - b; })
    nomerBrawser_arg = nomerBrawser_argDiapason.sort(function compareNumbers(a, b) { return a - b; })
    open_it_func()
  }
  function open_it_func() {
    if (nomerBrawser_arg != "") {
      nomerBrawser_arg.forEach((item, i, nomerBrawser_arg) => {
        try {
          var nomer_v_massive = item - 1;
          while (tblrMakeLaunchPause == 1 && firstloop_is == 1) {
            //console.log("нужен перерыв в открытии браузеров...")
            try {
              sleep(1500);
            } catch (e) { console.log("sleep ошибка :" + e) }
          }
          start_opening_and_connection(browser_full_id[nomer_v_massive], item, nomerBrawser_arg);
          count_opened_browsers = count_opened_browsers + 1;
          try {
            sleep(2000); // почемуто тут только sleep работает
          } catch (e) { console.log("sleep ошибка :" + e) }
          firstloop_is = 1;
          return;
        } catch (erz) { console.log("nomerBrawser_arg.forEach :" + erz) }
      });
    } else {
      if (nomerBrawser_arg == "") {
        console.log("Аргументов нет. Пока пока.");
        process.exit();
      }
    };
  }
}

//функция завершения работы и закрытия браузеров
async function ask_for_close(nomer_brauser, browser_id, nomerBrawser_arg, page, browser) {
  (async () => {
    if (close_type == 0) { //  без таймера закрытие ( инстант) 
      try {
        if (await browser.isConnected()) {
          browser.close();
        }
      } catch (e) { console.log("ошипка 798534 = " + e) }

      if (isRotationNeeded == 1) {
        await changeFCKNG_ip() // запрос на смену IP
      } else {
        var dd = new Date(Date.now());
        var ss = dd.getSeconds();
        countFinishedBrowsers = countFinishedBrowsers + 1;
        lastBrowserFinishedSecs = ss;
        count_andclose_OR_no()
      }

      async function changeFCKNG_ip() {  // функция отправляет запрос на смену пароля  //
        var vremeni_proshlo = Math.round((new Date().getTime() / 1000) - last_time_IP_changed) // от текущего времени, отнимаю время предыдущей смены
        //console.log("vremeni_proshlo = " + vremeni_proshlo)
        if (vremeni_proshlo > ip_change_interval) {
          alert(6, " [ закончил за " + vremeni_proshlo + "сек. / запрос на смену IP отправлен ]");
          await axios.get(rotationLink)
            .then(res => {
              alert(6, " [ IP сменён ]");
              last_time_IP_changed = new Date().getTime() / 1000;
              var dd = new Date(Date.now());
              var ss = dd.getSeconds();
              countFinishedBrowsers = countFinishedBrowsers + 1;
              lastBrowserFinishedSecs = ss;
              count_andclose_OR_no()
            })
            .catch(err => {
              var ernum = 0;
              console.log("ошибка при запросе на смену IP = " + err)
              delay(5000);
            })
        } else {
          var timeToWait = ip_change_interval - vremeni_proshlo
          alert(6, "закончил за " + vremeni_proshlo + " сек. / sockcs должны остыть, \x1b[35m" + timeToWait + "\x1b[33m сек.")
          await delay(timeToWait * 1000)
          await delay(1000) // нужно, лишние разы цикл срабатывает
          await changeFCKNG_ip()
        }
        return
      }

      //console.log("666666")

    } else {  // с таймером чтобы обновился прокси
      alert(1, nomer_brauser + " закончил работу. перехожу к следущему через 55 сек...");
      try {
        browser.close();
      } catch { }
      await delay(timewaitInCaseAutoRotationProxyes * 1000)
      var dd = new Date(Date.now());
      var ss = dd.getSeconds();
      countFinishedBrowsers = countFinishedBrowsers + 1;
      lastBrowserFinishedSecs = ss;
      count_andclose_OR_no() // только вставил сюда, проверить не успел
    }
    async function count_andclose_OR_no() {
      iznachalnoye_kolichestvo_zaprashyvaemyhBrausers = Object.keys(nomerBrawser_arg).length;
      if (countFinishedBrowsers == iznachalnoye_kolichestvo_zaprashyvaemyhBrausers) {
        // ждёт пока запрошенные будут выполнены. Ждет завершения работы //
        alert(4, programma.toUpperCase() + " завершена, пока! [" + nomerBrawser_arg.length + " браузер(а/ов)] -  " + nomerBrawser_arg);
        (async () => {
          if (programma == "twicolTEST" || programma == "twicol") { //если твиттер собрать usernames запущена, выполнить
            twiusARRAY_tranform(twiusArr, twius_namesArr); //ВРЕМЕННО тут
            await delay(1000)
          }
          process.exit();
        })();
        keypress(process.stdin); //обработка нажатия для выхода
        process.stdin.setRawMode(true); // listen for the "keypress" event
        process.stdin.resume();
        process.stdin.on('keypress', function (ch, key) {
          //console.log('got "keypress"', key);
          if (key && key.name == 'c') {
            nomerBrawser_arg.forEach((item, i, nomerBrawser_arg) => {
              setTimeout(() => {
                (async () => {
                  count_CLOSED_Browsers = count_CLOSED_Browsers + 1;
                  console.log("\x1b[0;30m", ">>>>>  вызвал закрытие id : " + item);
                  await axios.get('http://' + host + ':3001/v1.0/browser_profiles/' + browser_full_id[item - 1] + '/stop');
                  await checkCOmpletedWorkAndCloseBrowser(iznachalnoye_kolichestvo_zaprashyvaemyhBrausers, count_CLOSED_Browsers);
                })();
              }, i * 300);
            });
          }; // конец IF
        }); // конец обработчика кнопок
        process.stdin.setRawMode(true);
        process.stdin.resume();
        //обработка нажатия для выхода //
      }; //конец первого if
    }
    try {
      delay(2000)
    } catch { }

  })();
}; //конец функции
function alert(alertType, alertText) {
  switch (alertType) {
    case 1: // синий, для Глобальных уведомления из главного скрипта 
      console.log('\x1b[1;34m%s\x1b[0m', "" + alertText + "\x1b[30m");
      break;
    case 2:
      console.log("\x1b[0;32m", alertText + "\x1b[30m"); // темно зеленый. Юзаю как подпроцесс 6
      break;
    case 3:
      console.log('\x1b[35m%s\x1b[0m', "⁉️ 🤯 " + alertText + "\x1b[30m"); // красный - аларм
      break;
    case 4:
      console.log("\x1b[1;32m", "⚡ " + alertText + "\x1b[30m"); // зеленый. Глобальный успех 
      break;
    case 5:
      console.log("\x1b[36m", alertText + "\x1b[30m"); // голубенький. Начало работы процесса на странице 
      break;
    case 6:
      console.log('\x1b[33m%s\x1b[0m', alertText + "\x1b[30m"); // бледно желтый цвет, для уведомлений о выполненной работе из браузера(со страницы) 
      break;
  }
}
//функция закрытия программы ПОСЛЕ закрытия ВСЕХ браузеров и окончания всех програм
async function checkCOmpletedWorkAndCloseBrowser(iznachalnoye_kolichestvo_zaprashyvaemyhBrausers, count_CLOSED_Browsers) {
  //console.log("checkCOmpletedWorkAndCloseBrowser запустился");
  //console.log("iznachalnoye_kolichestvo_zaprashyvaemyhBrausers = " + iznachalnoye_kolichestvo_zaprashyvaemyhBrausers);
  //console.log("count_CLOSED_Browsers                           = " + count_CLOSED_Browsers);
  if (iznachalnoye_kolichestvo_zaprashyvaemyhBrausers == count_CLOSED_Browsers) {
    await process.exit();
  };
};

// ОСНОВНАЯ ФУНКЦИЯ ЗАПУСКА БРАУЗЕРА
// ОСНОВНАЯ ФУНКЦИЯ ЗАПУСКА БРАУЗЕРА
// ОСНОВНАЯ ФУНКЦИЯ ЗАПУСКА БРАУЗЕРА
function start_opening_and_connection(browser_id, nomer_brauser, nomerBrawser_arg) {
  console.log('\x1b[1;34m%s\x1b[0m', nomer_brauser + " = > " + JSON.stringify(programma).slice(1, -1).toUpperCase() + "...")
  axios.get('http://' + host + ':3001/v1.0/browser_profiles/' + browser_id.replace(/[^0-9]/g,"") + '/start?automation=1')
    .then(res => {
      const headerDate = res.headers && res.headers.date ? res.headers.date : 'no response date';  //console.log('Status Code:', res.status); //console.log('Date in Response header:', headerDate);
      const result = res.data; //console.log(`Port : ${result.automation.port}, wsEndpoint: ${result.automation.wsEndpoint}`);
      const port = result.automation.port; //console.log('Port1: ', port);
      delay(333);
      start_automatisation(port, result.automation.wsEndpoint, nomer_brauser, browser_id, nomerBrawser_arg);
    })
    .catch(err => {  //в случае ошибки в ответе при запуске, пытаться запустить ЕСЩЁ!
      var ernum = 0;
      (async () => {   //await console.log('Ашипка : ', err.message);
        ernum = ernum + 1;
        if (ernum = 3) {
          //console.log("else ernum = 3 !!!!!! " + ernum)
          await console.log("\x1b[35m", "не смог открыть " + nomer_brauser + ", попытка через 3 сек.....");
          await delay(3000);
          ernum = ernum + 1;
          await start_opening_and_connection(browser_id, nomer_brauser, nomerBrawser_arg);
        } else {
          await console.log("\x1b[35m", "не смог открыть " + nomer_brauser + ", попытка через 3 сек.....");
          await delay(3000);
          ernum = ernum + 1;
          await start_opening_and_connection(browser_id, nomer_brauser, nomerBrawser_arg);
        }
      })();
    }
    );
}
//ОСНОВНАЯ ФУНКЦИЯ старта автоматизации
async function start_automatisation(port_main, wsendpoint_main, nomer_brauser, browser_id, nomerBrawser_arg) {
  (async () => {
    // НЕПОСРЕДСТВЕННО ПОДКЛЮЧЕНИЕ
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint: `ws://127.0.0.1:${port_main}${wsendpoint_main}`})
      //работа с вкладками перед началом работы
      var pageList = await browser.pages();
      var kolichestvo_vkladok = pageList.length;//// await delay(50);
      const page = await browser.newPage();
      // ЦИКЛ закрываю лишние вкладки
      var ass = 69; while (ass < 100) {
        var pageList = await browser.pages();
        var kolichestvo_vkladok = pageList.length;
        if (kolichestvo_vkladok > 1) {
          var badPage = (await browser.pages())[0];
          await badPage.close();
        }
        else {
          ass = 101;
        }
      };
      await page.setDefaultNavigationTimeout(0);
      // СПИСОК КОМАНД И ФУНКЦИЙ, ВЫЗЫЫВАЕМЫХ ИМ

      if (programma == "twifol") { // twitter подписаться
        await twifol(page, nomer_brauser, browser_id, nomerBrawser_arg, delay, ask_for_close, alert, browser, fs, twitter_vsplyvauchie_OKNA)
      }
      else if (programma == "preregraf") { // premint register raffle - регистрация в преминт рафл 
        await preRegRaf(page, nomer_brauser, browser_id, nomerBrawser_arg, delay, ask_for_close, browser)
      }
      else if (programma == "programma3") { // пример программы 3
        await programma3(page, nomer_brauser, browser_id, nomerBrawser_arg, delay, ask_for_close, alert, browser, fs)
      }
      else if (programma == "programma4") { // пример программы 4
        await programma4(page, nomer_brauser, browser_id, nomerBrawser_arg, delay, ask_for_close, alert, browser, fs)
      }
      else { alert(3, "команда неизвестна!"); await delay(1000); ask_for_close(nomer_brauser, browser_id, nomerBrawser_arg, page, browser) }
    } catch (er) { console.log("ошибка коннекта в функции start_automatisation : " + er) }
  })();
};

// функция/подпрограмма twifol
async function twifol(page, nomer_brauser, browser_id, nomerBrawser_arg, delay, ask_for_close, alert, browser, fs, twitter_vsplyvauchie_OKNA) {
  await page.setViewport({ width: 940, height: 540 })
  await page.goto("https://twitter.com/home", ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']);
  await twitter_vsplyvauchie_OKNA(page, nomer_brauser) // идет на домашнюю страницу, проверяет и закрывает высплывающие окна
  // до символа @ подписка, после @ репост+лайк
  var input_argsLinks = process.argv[4]
  var input_argsLinSplitted = input_argsLinks.split("@")
  var linksToFollow = input_argsLinSplitted[0]
  var linksToRepost = input_argsLinSplitted[1]

  // работаю с ссылками на подписку
  if (linksToFollow.length == 0) {
    alert(6, "  Ссылок для подписки не передано.")
  } else {
    let linksArr = [];
    for (i in linksToFollow.split("http")) {
      if (i != 0) {
        linksArr.push("https://" + linksToFollow.split("http")[i].slice(4))
      }
    }
    alert(5, " Ссылок для подписки : " + linksArr.length + " шт. работаю....")
    for (u in linksArr) { //прохожусь по всем ссылкам подряд, подписываясь //
      var follow_target = linksArr[u].slice(20)
      //console.log(follow_target)
      await twitter_follow(follow_target, page) // функция подписывает на твиттер и возвращает на страницу home
      if (u == 0) {
        alert(1, nomer_brauser + " > подписался на первый аккаунт " + follow_target)
      } else {
        alert(1, nomer_brauser + " > подписался на аккаунт " + follow_target)
      }
      await delay(random(3000, 10000)); // долго подождать рандомно
    }
  }

  // работаю с ссылками на репост+лайк  //
  if (linksToRepost == undefined) {
    alert(6, "  Ссылок для репоста не передано.")
  } else {
    let linksRepostArr = [];
    for (i in linksToRepost.split("http")) {
      if (i != 0) {
        linksRepostArr.push("https://" + linksToRepost.split("http")[i].slice(4))
      }
    }
    alert(5, " Ссылок для репоста : " + linksRepostArr.length + " шт. работаю....")
    for (u in linksRepostArr) { //прохожусь по всем ссылкам подряд, делая репост //
      await page.goto(linksRepostArr[u], ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']);
      await delay(random(700, 2300))
      //      //  лайкаю //
      // page.repl()
      try {
        await page.waitForSelector("div[aria-label='Like']", { timeout: 1500 })
        alert(6, "лайкаю....")
        await page.focus("div[aria-label='Like']"); await delay(random(1500, 3000))
        var likeCords = await getElementCoordinates(page, "div[aria-label=Like]")
        var xy = { x: likeCords.x + random(1, 25), y: likeCords.y + random(1, 25) }
        await page.mouse.click(xy.x, xy.y)

        alert(6, "        ...лайкнул.")
      }
      catch (err) {

        alert(6, " кнопка лайк не найдена, возможно ты уже лайкнул. Иду дальше... ")
        //console.log("error = " + err)
      }
      await delay(random(1000, 2500))
      //      // репощу //
      try {
        await page.waitForSelector("div[aria-label='Retweet']", { timeout: 1500 })
        alert(6, "репощу....")
        await page.focus("div[aria-label='Retweet']"); await delay(random(1500, 2000))
        var likeCords = await getElementCoordinates(page, "div[aria-label=Retweet]")
        var xy = { x: likeCords.x + random(1, 25), y: likeCords.y + random(1, 25) }
        await page.mouse.click(xy.x, xy.y)// кликаю репост
        await delay(random(700, 1200))
        await page.mouse.click(xy.x, xy.y) // второй раз кликаю репост
        alert(6, "        ...репостнул.")
      }
      catch {
        alert(6, " кнопка репост не найдена, возможно ты уже репостнул. Иду дальше... ")
      }

      await delay(random(3500, 5600))
      alert(1, nomer_brauser + " > репост и лайк номер " + (Number(u) + 1) + " сделал! ")
    }
  }

  alert(4, nomer_brauser + " >>> готов!!");
  // вызываю функцию ask_for_close - что означает что ПОДПРОГРАММА завершила работу с этим браузером.
  await ask_for_close(nomer_brauser, browser_id, nomerBrawser_arg, page, browser);
  m = 99999; return;
}

// функция/подпрограмма регистрация в преминт рафл 
async function preRegRaf(page, nomer_brauser, browser_id, nomerBrawser_arg, delay, ask_for_close, browser) {
  let linksArr = [];
  var premint_links_toRegister = process.argv[4];
  // обрабатываю ссылки входящие в один аргумент при запуске
  for (i in premint_links_toRegister.split("http")) {
    if (i != 0) {
      linksArr.push("https://" + premint_links_toRegister.split("http")[i].slice(4))
    }
  }
  //console.log("linksArr =" + linksArr)

  for (u in linksArr) {  // основной цикл прохода по всем рафлам
    await page.setDefaultNavigationTimeout(0);
    await page.setViewport({ width: 940, height: 540 })
    await page.goto(linksArr[u], { waitUntil: ['load'] });
    //page.repl()

    var textPagePrem = await page.$eval("#st-container > div > div > div > section.slice.sct-color-2.border-bottom > div > div > div.col-lg-5.ml-lg-auto.mb-5 > form > div:nth-child(2) > div.card-title", e => e.outerText)
    if (textPagePrem.includes("Registered")) {
      alert(4, nomer_brauser + " ты уже зерегистрирован в рафл!")
      await pred_continuefunction() //функция для уведомления о завершении прохода по одному преминту 
      continue
    } else {
      // двигаюсь к регистрации...
      alert(2, " registered не найдено, работаю дальше...")


      //ищу и нажимаю кнопку ЗАРЕГИСТРИРОВАТЬСЯ
      if (await findAndPressRegisterBTTN()) {
        alert(6, nomer_brauser + " > Click to register нажата")
      } else {
        alert(3, nomer_brauser + " кнопка click to register не найдена! возможно ты не зерагн на преминте. выхожу.")
        await pred_continuefunction() //функция для уведомления о завершении прохода по одному преминту 
        continue // прыгаю в конец цикла
      }

      //поиск на странице ошибок! 2 сек  // --- оставить????
      /*if ((await find_registrationErrorsPremint())) {
        //continue
      } else {
        console.log("нашлась ошибочка на сранице, наверно тут надо написать continue")
      }*/


      //теперь ищу подтверждения что успешно зарегался в рафл
      try {
        //page.repl(); await delay(999999)
        await page.waitForSelector("#st-container > div > div > div > section.slice.sct-color-2.border-bottom > div > div > div.col-lg-5.ml-lg-auto.mb-5 > form > div:nth-child(2) > div.card-title", { timeout: 50000 })
        var textPagePrem = await page.$eval("#st-container > div > div > div > section.slice.sct-color-2.border-bottom > div > div > div.col-lg-5.ml-lg-auto.mb-5 > form > div:nth-child(2) > div.card-title", e => e.outerText)
        if (textPagePrem.includes("Registered")) {
          alert(4, nomer_brauser + " успешно зарегистрировался в рафл!")
          await pred_continuefunction() //функция для уведомления о завершении прохода по одному преминту 
          continue // прыгаю в конец цикла
        } else {
          //поиск на странице ошибок! 2 сек 
          if (!(await find_registrationErrorsPremint())) {
            continue
          }
          //page.repl()
          console.log("я тутттт")
          //await delay(999999)
        }
        console.log("успешно зарегался в рафл.")
      } catch (e) {
        console.log("чтото не так 458512 err = " + e)
        //page.repl()
        //await delay(999999)

      }

    } // конец if "если не зарегистрирован"
    console.log("подошел к оконцу основго цила for")
    await delay(9999999)
    await pred_continuefunction() //функция для уведомления о завершении прохода по одному преминту 
  } // конец основного цикла for 



  //console.log("программа подошла к концу.")
  //await delay(9999999)

  async function findAndPressRegisterBTTN() {    // нажимаю кнопку учавствовать
    try { // если кнопка найдена
      await page.waitForSelector("#registration_status > div > button", { timeout: 1500 })
      await delay(random(2500, 3500))
      alert(6, "кнопку 'зарегистрироваться' нажимаю....")
      page.click("#registration_status > div > button")
      await page.waitForNavigation()
      return true
    } catch (e) { // если кнопка не найдена
      return false
    }
  }
  async function pred_continuefunction() { //функция для уведомления о завершении прохода по одному преминту
    u = Number(u) + 1
    if (u == linksArr.length) {
      alert(1, " Прошёл по всем из " + linksArr.length + " преминтов. Работу закончил.")
      await delay(random(1000, 3000))
      await ask_for_close(nomer_brauser, browser_id, nomerBrawser_arg, page, browser)
      return;
    } else {
      alert(1, " Прошёл по " + u + " из " + linksArr.length + " преминтов......")
    }
  }
  // функция поиска на странице ошибок в регистрации
  async function find_registrationErrorsPremint() {
    try {
      await page.waitForSelector("div[role=alert]", { timeout: 4000 })
      alert(3, "Чтото не так с регистрацией! - вот сам прочитай : " + (await page.$eval("div[role=alert]", e => e.outerText)))
      //tgMSG(nomer_brauser + " Чтото не так с регистрацией в преминт рафл! - вот сам прочитай : " + (await page.$eval("div[role=alert]", e => e.outerText)))
      await pred_continuefunction() //функция для уведомления о завершении прохода по одному преминту 
      return false // true  - значит всё ок. Раньше тут было continue 
    } catch {
      alert(6, "ошибок при регистрации не найдено.")
      return true
    }
  }
}

//// вспомогательные функции ////
async function twitter_vsplyvauchie_OKNA(page, nomer_brauser) {  // проверяю и закрываю высплывающие окна
  //функция вызывается перед переходом куда либо, поэтому 
  // начала иду на домашнюю страницу
  await page.goto('https://twitter.com/home', ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']);
  await delay(1500)

  //проверяю, а не залогинен ли аккаунт уже
  var is_twitter_logged = await page.evaluate(() => window.find("Home"));
  if (is_twitter_logged
    || page.url() == "https://twitter.com/home") {
    alert(2, "[OK] " + nomer_brauser + " в твитер залогинен...");
  } else {
    alert(3, nomer_brauser + " / ТВИТТЕР НЕ ЗАЛОГИНЕН, закончил.");
    await ask_for_close(nomer_brauser, browser_id, nomerBrawser_arg, page, browser);
  };
  //page.repl()

  //проверка и смена языка
  if (!is_twitter_logged
    && page.url() == "https://twitter.com/home") {
    alert(5, "похоже что язык не english, иду менять...")
    if (await changeLangTwitter(page)) { // меняю язык на eng
      alert(2, "[OK] язык сменён на english");

    } else { alert(3, " чтото не получилось сменить язык... иду дальше") }
  } else {
    alert(2, "[OK] проверка на английский язык пройдена.")
  }

  //проверка на необходимость доп. проверки на человечность
  switch (page.url()) {
    case "": console.log("url пустой")
      break;
    //case includes("access"): console.log("access")
    case "https://twitter.com/account/access":
      alert(3, nomer_brauser + " >>> нужна дополнительная верификация twitter!!! 'https://twitter.com/account/access' закрываю.");
      break;
  }

  ////              ////        ///       работа с всплывающими окнами:   ///       ////
  await delay(3000)

  //Welcome to Twitter надпись // lets go кнопка
  try {
    await page.waitForSelector('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div.css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div > div > a', { timeout: 1300 });
    console.log("\x1b[1;36m", "обнаружена Welcome to Twitter надпись, lets go кнопка..."); await delay(300)
    //await delay(1111111)
    //page.$eval('#react-root > div > div > div.css-1dbjc4n.r-18u37iz.r-13qz1uu.r-417010 > main > div > div > div > div > div > div.css-1dbjc4n.r-1jgb5lz.r-1ye8kvj.r-13qz1uu > div > div > div > a', el => el.href);
    //await page.mouse.move(348, 377); await delay(77)
    //await page.mouse.click(348, 377)
    //console.log("\x1b[1;36m", "... нажал на неё."); 
    while (page.url() != "https://twitter.com/i/connect_people") {
      console.log("while. нажимаю lets go.. / url = " + page.url())
      await page.mouse.move(348, 377); await delay(77)
      await page.mouse.click(348, 377)
      await delay(1489)
    }
    console.log("\x1b[1;36m", "... заодно по перейдённой странице делаю одну подписку. Возвращаюсь обратно..."); await delay(10)
    await delay(2000)
    await page.mouse.move(715, 131); await delay(177)
    await page.mouse.click(715, 131); await delay(1777)
    await page.goBack(); await page.goBack();
    page.reload(); // назад в браузере и перезагрузка страницы.
    await page.waitForNavigation()
  } catch (err67) { alert(2, "[OK] Welcome to Twitter надписи, lets go кнопки не обнаружено") }




  // окно Review your phone //
  if ((await page.$eval("body", e => e.outerText)).includes("still your phone number?")) {
    alert(6, "обнаружен запрос на подтверждение номера (мой/не мой)...");
    await delay(random(1000, 3000))
    await page.mouse.click(463, 280)
    alert(2, "обработано!");
  } else {
    alert(2, "[OK] окно Review your phone не обнаружено");
  }

  // проверяю окно Turn on notifications // 
  if ((await page.$eval("body", e => e.outerText)).includes("Get the most out of Twitter by staying up to date with what's happening")) {
    alert(6, "обнаружено окно Turn on notifications...");
    await delay(random(1000, 3000))
    await page.mouse.click(452, 291)
    await delay(random(1000, 3000))
    // и следом еще одна херня всплывает, жму ОК
    await page.mouse.click(495, 272)
    alert(2, "обработано!");
  } else {
    alert(2, "[OK] окно Turn on notifications не обнаружено");
  }

  //before you scroll окно // 
  if ((await page.$eval("body", e => e.outerText)).includes("Before you scroll…")) {
    alert(6, "обнаружено окно before you scroll...");
    await delay(random(1000, 3000))
    await page.mouse.click(468, 507)
    await delay(random(1000, 3000))
    alert(2, "обработано!");
  } else {
    alert(2, "[OK] окно before you scroll не обнаружено");
  }

  // окно An update to your data-sharing settings 
  if ((await page.$eval("body", e => e.outerText)).includes("The control you have over what information Twitter shares with its business partners has changed. Specifically, your ability to control mobile app advertising measurements has been removed, but you can control whether to share some non-public data to improve Twitter’s marketing activities")) {
    alert(6, "обнаружено окно An update to your data-sharing settings...");
    await delay(random(1000, 3000))
    await page.mouse.click(463, 408)
    await delay(random(1000, 3000))
    alert(2, "обработано!");
  } else {
    alert(2, "[OK] окно An update to your data-sharing settings не обнаружено");
  }
  /* try {
     if (await page.evaluate(() => window.find("The control you have over what information Twitter shares with its business partners has changed. Specifically, your ability to control mobile app advertising measurements has been removed, but you can control whether to share some non-public data to improve Twitter’s marketing activities on other sites and apps. These changes, which help Twitter to continue operating as a free service, are reflected now in "))) {
       await delay(random(1000, 3100))
       await page.click("#layers > div:nth-child(3) > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-xr3zp9.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-14lw9ot.r-1867qdf.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-13qz1uu > div > div > div > div > div.css-1dbjc4n.r-13qz1uu > div > div")
       alert(6, "[OK] окно An update to your data-sharing settings скрыто");
     }
   } catch { }*/


  //черная полоса снизу -  "куки принять все"
  try {
    await page.waitForSelector("#layers > div > div > div > div > div > div.css-1dbjc4n.r-eqz5dr.r-1w6e6rj.r-11wrixw.r-1r5su4o.r-vakc41.r-13qz1uu > div:nth-child(1) > div > span > span", { timeout: 1000 })
    console.log("\x1b[1;36m", "обнаружена черная полоса снизу 'принять все куки'..."); await delay(10)
    await page.hover("#layers > div > div > div > div > div > div.css-1dbjc4n.r-eqz5dr.r-1w6e6rj.r-11wrixw.r-1r5su4o.r-vakc41.r-13qz1uu > div:nth-child(1) > div > span > span")
    await delay(100)
    await page.click("#layers > div > div > div > div > div > div.css-1dbjc4n.r-eqz5dr.r-1w6e6rj.r-11wrixw.r-1r5su4o.r-vakc41.r-13qz1uu > div:nth-child(1) > div > span > span")
    console.log("\x1b[1;36m", "...нажал на неё"); await delay(1000)
  } catch (e98) { alert(2, "[OK] 'принять все куки' не убнаружено"); }




  //требование сменить пароль (после логина обычно)
  try {
    var twiiterPageStatePassrequired = await page.waitForSelector("body > div.PageContainer > div > div.PageHeader.Edge", { timeout: 500 })
    console.log('\x1b[1;34m%s\x1b[0m', nomer_brauser + " / требование сменить пароль. я пока не умею, выхожу через 10 сек.")
    await delay(10000)
    await ask_for_close(nomer_brauser, browser_id, nomerBrawser_arg, page, browser);
  } catch (eerer) { alert(2, "[OK] Password change required запроса не обнаружено"); }



  // проверяю окно Security Update
  try {
    if ((await page.$eval("#layers > div:nth-child(3) > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-xr3zp9.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-14lw9ot.r-1867qdf.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-13qz1uu > div > div.css-1dbjc4n.r-1awozwy.r-16y2uox > div > div.css-1dbjc4n.r-98ikmy.r-hvns9x > div.css-1dbjc4n.r-13qz1uu > div > div > span > span", el => el.outerHTML))
      .includes("Got it")) {
      await delay(random(1000, 3100))
      // закрываю окно
      await page.click("#layers > div:nth-child(3) > div > div > div > div > div > div.css-1dbjc4n.r-1awozwy.r-1kihuf0.r-18u37iz.r-1pi2tsx.r-1777fci.r-1pjcn9w.r-xr3zp9.r-1xcajam.r-ipm5af.r-g6jmlv > div.css-1dbjc4n.r-14lw9ot.r-1867qdf.r-1jgb5lz.r-pm9dpa.r-1ye8kvj.r-1rnoaur.r-13qz1uu > div > div.css-1dbjc4n.r-1awozwy.r-16y2uox > div > div.css-1dbjc4n.r-98ikmy.r-hvns9x > div.css-1dbjc4n.r-13qz1uu > div > div > span > span")
      alert(6, "[OK] окно Security Update скрыто");
    }
  } catch { }


  // окно You’re in control 
  if ((await page.$eval("body", el => el.outerText)).includes("Ads on Twitter are what keep our service free.")) {
    await delay(random(1500, 3100))
    await page.mouse.click(424, 435)
    alert(6, " [OK] окно You’re in control скрыто");
  } else alert(2, "[OK] окно You’re in control не обнаружено");


  return
}

async function twitter_follow(target, page) { // функция подписывает на твиттер и возвращает на страницу home
  // перехожу по кнопке "поиск"
  try {
    var searchBttn = await page.$x("//a[@href='/explore']")
    await delay(random(1000, 1500)) // уменьшил с x.2500
    await searchBttn[0].click()
    // ввожу логин на кого подписаться в поиск 
    await delay(random(900, 1500))
    await page.waitForSelector('input[placeholder="Search Twitter"', { timeout: 60000 })
    await page.type('input[placeholder="Search Twitter"]', target)
    await delay(random(2000, 3000)) // уменьшил с 4.5
    //page.repl(); 
    // нажимаю go to "twitter username"
    // спорная следущая строчка, мб переделать. (тут ошибка бывает, строка через одну вылетает)
    await page.waitForSelector("span[class='css-901oao css-16my406 r-poiln3 r-bcqeeo r-qvutc0']", { timeout: 5000 })
    var linkToShosenUser = await page.$x("//span[contains(text(), 'Go to @')]")
    linkToShosenUser[0].focus(); await delay(420)
    linkToShosenUser[0].click()
    await page.waitForNavigation()
    //await delay(999999)
    await find_and_pressFollowButton()
  } catch (e) {
    alert(3, "кнопка 'search' на найдена, или что-то ещё. (не подписался) error = " + e.stack)
    alert(3, "перезагружаю страницу...")
    await page.reload()

    //page.repl()
    //await delay(999999)
    //}
  }
  // тут потыкать пробел
  //

  await delay(random(1000, 2200))
  //перезагрузить и проверить снова - подписался ли? 
  await page.reload()
  await find_and_pressFollowButton()

  await delay(random(1000, 1200))
  await page.goBack();
  await delay(random(500, 1200))
  await page.goBack() // возвращаюсь на /home


  // функция поиска и нажатия follow
  async function find_and_pressFollowButton() {
    try { // ищу кнопку "follow"
      // жду прогруза страницы
      //while (!(await page.title()).includes(target)) {
      while (!(await page.url()).includes(target)) {
        //console.log("итерация поиска логина в page.title")
        // console.log("page.title() = " + page.title())
        await delay(1000)
      }
      //page.repl()
      await delay(random(1500, 2000))
      //console.log("начинаю поиск кнопки follow")
      var visibleText = await page.$eval("[data-testid='1470147838822731781-follow']", e => e.outerText)
      var visibleTextCutted = visibleText[6] // должно быть равно букве i, если Follow[I]ng
      if (visibleTextCutted != "i") {
        await delay(random(2000, 7000))
        // нажимаю follow  
        var x = random(670, 720); var y = random(271, 285);
        await page.mouse.move(x, y); // было 700, 275
        await delay(random(200, 400));
        await page.mouse.click(x, y)
        await delay(random(500, 1800))
        // нужно в другом месте сразу кликнуть, чтобы потом без проблем ПРОБЕЛОМ листать вниз
        await page.mouse.click(818, random(380, 400))
        alert(6, " успешно подписался на " + target)
        await delay(random(500, 600))
        await space_button_random_scroller(page, 1, 1)
        // await page.repl()
      } else {
        //уже подписан
        alert(6, " похоже что уже подписан на " + target + " :) ") // Ошибка = " + e)
      }
      await delay(random(1000, 2000)) // уменьшил с 1.4
    } catch (e) {
      console.log("Ошибка 4558 = " + e)
    }
  }
}

async function space_button_random_scroller(page, ot, doo) {  // рандомный пролистыватель пробелом
  var walkingtimee = random(ot, doo) // сколько раз делать сеансы скроллинга вниз =) 
  //console.log("walkingtimee = " + walkingtimee)
  for (var iza = 1; iza <= walkingtimee; iza++) {
    //console.log("итерирую на*")
    switch (random(1, 2)) {
      case 1:
        page.keyboard.press('Space'); // нажимаю пробел
        break;
      case 2:
        page.keyboard.press('Space'); await delay(180)
        page.keyboard.press('Space');
        break;
    }
    await delay(random(700, 3000))

  }
}

function random(min, max) { // ВЕЛИЧАЙШИЙ рандомайзер всех времён и людей
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function getElementCoordinates(page, selector) {
  try {
    var elementBttn = await page.waitForSelector(selector, { timeout: 2000 })
    var coordinates = await page.evaluate(el => {
      const { x, y } = el.getBoundingClientRect();
      return { x, y };
    }, elementBttn);
    return coordinates
  } catch {
    // console.log("элемент не найден")
    return false
  }
}
async function changeLangTwitter(page) { // функция смены языка в твиттер
  await page.goto('https://twitter.com/settings/languages', { waitUntil: 'domcontentloaded' });  // domcontentloaded
  await delay(1000)
  await page.mouse.click(random(208, 328), random(195, 202)) // кнопка сменить язык
  await delay(700)

  await page.select("#SELECTOR_1", "en-gb") // выбрал нужный мне язык в выпадающем списке
  await delay(655)
  page.mouse.click(728, random(221, 250)) // кнопка save
  await page.waitForNavigation()
  await page.goBack(); await page.goBack(); // возвращаюсь на https://twitter.com/home
  return true;
}