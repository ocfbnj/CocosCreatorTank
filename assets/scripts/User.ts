import Game from "./Game/Game";
import { GameMode } from "./Game/Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class User extends cc.Component {
    public id: number = -1;
    public wsUser: WebSocket = null;

    protected onLoad() {
        cc.game.addPersistRootNode(this.node);

        cc.director.preloadScene("Game");

        /**
         * 登录
         */
        this.wsUser = new WebSocket("ws://118.178.91.76:8080/", "user");

        this.wsUser.onopen = (event) => {
            console.log("用户服务器被打开");
        }

        this.wsUser.onmessage = (event) => {
            let data = event.data;
            console.log(`从用户服务器接收到数据: ${data}`);
            data = JSON.parse(event.data);

            switch (data["type"]) {
                case "user":
                    this.id = data["id"];
                    cc.find("/Canvas/user_name").getComponent(cc.Label).string = `游客${this.id}`;
                    break;
                case "count":
                    let node = cc.find("/Canvas/online_count");
                    if (node) node.getComponent(cc.Label).string = `当前在线人数: ${data["value"]}`;
                    break;
                case "start game":
                    cc.director.loadScene("Game", () => {
                        cc.find("/Game").getComponent(Game).gameMode = GameMode.MORE;
                    });
                default:
                    break;
            }
        }

        this.wsUser.onerror = function (event) {
            console.log("用户服务器错误");

            cc.find("/Canvas/user_name").getComponent(cc.Label).string = "离线模式";
        };

        this.wsUser.onclose = function (event) {
            console.log("WebSocket被关闭");

            cc.find("/Canvas/user_name").getComponent(cc.Label).string = "离线模式";
        };
    }
}
