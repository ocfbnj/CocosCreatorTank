import User from "../User";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {
    private user: User = null;

    public onBtnOne() {
        cc.director.loadScene("Game");
    }

    public onBtnMore() {
        // 自动匹配玩家
        this.user.wsUser.send(JSON.stringify({
            "type": "start game",
            "id": this.user.id
        }));
    }

    protected onLoad() {
        cc.director.preloadScene("Game");

        this.user = cc.find("/User").getComponent(User);

        if (this.user.id != -1) {
            cc.find("/Canvas/user_name").getComponent(cc.Label).string = `游客${this.user.id}`;
        }
    }
}
