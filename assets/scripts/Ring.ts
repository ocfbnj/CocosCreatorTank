import PlayerTank from "./PlayerTank";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Ring extends cc.Component {
    play() {
        this.node.active = true;
        this.node.parent.getComponent(PlayerTank).isInvincible = true;

        this.getComponent(cc.Animation).play("ring");
        this.scheduleOnce(()=>{
            this.getComponent(cc.Animation).stop();
            this.node.parent.getComponent(PlayerTank).isInvincible = false;
            this.node.active = false;
        }, 5);
    }
}
