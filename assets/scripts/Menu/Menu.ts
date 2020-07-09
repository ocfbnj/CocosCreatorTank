const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    protected onLoad() {
        cc.director.preloadScene("Game");
    }

    public onBtnOne() {
        cc.director.loadScene("Game");
    }

    public onBtnMore() {

    }
}
