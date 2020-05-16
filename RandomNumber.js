/******************************************************************
 * This module is cleated yukuduri.                               *
 * Do you need a help?                                            *
 * You can show explanation in Japanese!                          *
 * → Qiita: https://qiita.com/yukuduri/items/832ecf8992c83ca1b389 *
 ******************************************************************/

module.exports = class RandomNumber{
  constructor(num, min = 0){
    this.num = num;
    this.min = min;
    this.init();
  }

  /*
   * getRandomIntメソッド
   * 処理：min以上max未満の乱数を返す。 
   * 引数
   * 　min：最小値（整数）
   * 　max：最大値（整数）
   * 返り値：生成された乱数
   */
  getRandomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  /* 
   * initメソッド
   * 処理：minを最小とするnum個の被りなしの乱数が入った配列this.aryを生成。
   * 引数
   * 　num：生成個数（整数）、初期値はthis.num
   * 　min：最小値（整数）、初期値はthis.min
   * 返り値：なし
   */
  init(num = this.num, min = this.min){
    this.index = 0;
    this.ary = [];
    let initAry = [];

    for(let i = 0; i < num; i++){
      initAry.push(min + i);
    }

    while(initAry.length > 0){
      this.ary.push(initAry.splice(this.getRandomInt(0,initAry.length), 1).pop());
    }
  }

  /* 
   * nextメソッド
   * 処理：実行するたびに、this.aryの要素を順に返す。
   * 　　　配列の最後までいったときははじめの要素に戻る。
   * 引数：なし
   * 返り値：this.index位置のthis.aryの要素
   */
  next(){
    if(this.index >= this.ary.length){
      this.index = 0;
    }
    return this.ary[this.index++];
  }
}