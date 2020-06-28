import { Globals } from "./Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpdateInformations extends cc.Component {
    @property(cc.Prefab)
    enemyIcon: cc.Prefab = null;

    @property(cc.Node)
    enemiesIcon: cc.Node = null;

    protected onEnable() {
        let gridLayout = this.enemiesIcon.getComponent(cc.Layout);

        let x = -4;
        let y = 80;

        for (let i = 0; i != 10; i++) {
            for (let j = 0; j != 2; j++) {
                let node = cc.instantiate(this.enemyIcon);
                node.name = "icon";
                node.parent = this.enemiesIcon;
            }
        }
    }

    protected onDisable() {
        this.enemiesIcon.removeAllChildren(true);
    }

    public deleteOneIcon() {
        this.enemiesIcon.children[this.enemiesIcon.childrenCount - 1].destroy();
    }

    public updatePlayerBlood(blood: number) {
        this.node.getChildByName("player_blood").getComponent(cc.Label).string = blood.toString();
    }

    public updateCurrentLevel(level: number) {
        this.node.getChildByName("cur_level").getComponent(cc.Label).string = level.toString();
    }
}
