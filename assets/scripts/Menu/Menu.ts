import User from "../User";

const { ccclass } = cc._decorator;

// TODO 添加菜单
@ccclass
export default class Menu extends cc.Component {
    user: User = null;

    onLoad() {
        cc.director.preloadScene("Game");

        this.user = cc.find("/User").getComponent(User);

        if (this.user.id != -1) {
            cc.find("/Canvas/user_name").getComponent(cc.Label).string = `游客${this.user.id}`;
        }

        if (this.user.wsUser) {
            this.user.wsUser.send(JSON.stringify({
                "type": "get count"
            }));
        }
    }

    onBtnOne() {
        cc.director.loadScene("Game");
    }

    onBtnMore() {
        // 自动匹配玩家
        this.user.wsUser.send(JSON.stringify({
            "type": "start game",
            "id": this.user.id
        }));
    }
}
