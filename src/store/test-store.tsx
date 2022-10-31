import React from 'react';
import ReactDOM from 'react-dom';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react';

// 对应用状态进行建模。
class Timer {
  secondsPassed = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increase() {
    this.secondsPassed += 1;
  }

  reset() {
    this.secondsPassed = 0;
  }
}

export const myTimer = new Timer();

// 构建一个使用 observable 状态的“用户界面”。
export const TimerView = observer(({ timer }) => (
  <button onClick={() => timer.reset()}>已过秒数：{timer.secondsPassed}</button>
));

ReactDOM.render(<TimerView timer={myTimer} />, document.body);

// 每秒更新一次 已过秒数：X 中的文本。
setInterval(() => {
  myTimer.increase();
}, 1000);
