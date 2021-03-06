import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import './player.less'
let rotateTimer = 0;
let timer = 0;
class Player extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isPaused:false,
            totalTime:"00:00",
            playedTime:"00:00",
            playPer:0,
            bufferedPer:0,
            playedLeft:0,
            detailPlayedLeft:0,
            volumnLeft:0,
            angle:0,
            mouseDown:false,
            musicListShow:false,
            currentMusic:{},
            isPlayed:false,
            playDetail:false,
            mode:"order"
        };
        this.last = this.last.bind(this);
        this.play = this.play.bind(this);
        this.next = this.next.bind(this);
        this.playMode = this.playMode.bind(this);
        this.random = this.random.bind(this);
        this.startChangeTime = this.startChangeTime.bind(this);
        this.moveProgress = this.moveProgress.bind(this);
        this.moveVolume = this.moveVolume.bind(this);
        this.startMoveVolume = this.startMoveVolume.bind(this);
        this.clickChangeTime = this.clickChangeTime.bind(this);
        this.showMusicList = this.showMusicList.bind(this);
        this.delMusic = this.delMusic.bind(this);
        this.playDetail = this.playDetail.bind(this)
        this.hidePlayDetail = this.hidePlayDetail.bind(this)
        this.rotate = this.rotate.bind(this)
    }

    componentDidMount(){
        let audio = this.refs.audio;
        let played = this.refs.played;
        let totalVolume = this.refs.totalVolume;
        audio.addEventListener('canplay',()=>{
            //获取总时间
            let totalTime = parseInt(audio.duration);
            this.setState({
                totalTime:this.getTime(totalTime),
                playedLeft:played.getBoundingClientRect().left,
                volumnLeft:totalVolume.getBoundingClientRect().left
            });
            //
        });
        //在组件最开始渲染时候，默认播放播放列表第一首歌

/*        this.setState({
            currentMusic:this.props.info[0]
        },()=>{

        });*/

        //设置初始音量
        this.refs.volumeProgress.style.width = "50%";
        audio.volume = 0.5
    }
/*    componentWillUnmount(){
        let audio = this.refs.audio;
        audio.removeEventListener('canplay')
    }*/
    componentWillReceiveProps(nextProps){
        if(nextProps.currentSong !== this.state.currentMusic && nextProps.currentSong !== undefined){
            this.setState({
                currentMusic:nextProps.currentSong
            },()=>{
                this.play()
            })
        }

    }
    playMode(){
        switch (this.state.mode){
            case "order":
                this.setState({
                    mode:'random'
                });
                return;
            case "random":
                this.setState({
                    mode:'single'
                });
                return;
            case "single":
                this.setState({
                    mode:'order'
                });
                return;
        }

    }
    random(){

        if(this.props.info.length !== 0){
            let randomIndex = Math.ceil(Math.random()*this.props.info.length-1);
            this.setState({
                currentMusic:this.props.info[randomIndex],
                angle:0
            },()=>{
                this.play()
            })
        }

    }
    last(){
        this.setState({
            angle:0
        });
        if(!this.state.currentMusic.src){
            return
        }
        let current = ""
        this.props.info.forEach((v,i)=>{
            if (v.src === this.state.currentMusic.src){
                current = i
            }
        });
        if(current>0){
            this.setState({
                currentMusic:this.props.info[current-1]
            },()=>{
                this.play()
            })
        }else{
            this.setState({
                currentMusic:this.props.info[this.props.info.length-1]
            },()=>{
                this.play()
            })
        }

    }
    rotate(){
        if(this.state.playDetail){

        }
        rotateTimer = setInterval(()=>{
            this.setState({
                angle:this.state.angle+1
            },()=>{
                this.refs.musicAvatar.style.transform = `rotate(${this.state.angle}deg)`;
                if(this.state.playDetail){
                    this.refs.detailMusicImg.style.transform = `rotate(${this.state.angle}deg)`;
                }
            })
        },33)
    }
    play(){
        clearInterval(rotateTimer)

        let audio = this.refs.audio;
        if(audio.paused && this.state.currentMusic.src){
            console.log(333)
            audio.play()
            this.setState({
                isPaused:true,
                isPlayed:true
            },()=>{
                this.rotate()

            })
        }else{
            audio.pause()
            this.setState({
                isPaused:false
            },()=>{
                clearInterval(rotateTimer)
            })
        }

        audio.addEventListener('timeupdate',()=>{
            //设置播放进度条
            let playPer = audio.currentTime/audio.duration;
            this.refs.played.style.width = playPer*100+"%";
            //设置缓冲进度条
            let timeRages = audio.buffered;
            let bufferedTime = 0
            if(timeRages.length !== 0){
                bufferedTime = timeRages.end(timeRages.length-1);
            }
            let bufferedPer = bufferedTime/audio.duration;
            this.refs.buffered.style.width = bufferedPer*100+"%";
            //设置剩余时间
            let playedTime = parseInt(audio.currentTime);

            this.setState({
                playedTime:this.getTime(playedTime),
            });
            //播放完成后根据播放模式设置歌曲的顺序
            if(audio.ended){
                clearInterval(rotateTimer)

                if(this.state.mode === 'order'){
                    this.next()
                }else if(this.state.mode === 'random'){
                    this.random()
                }else if(this.state.mode === 'single'){
                    this.setState({
                        angle:0
                    });
                    this.play()
                }
            }
        });

    }
    next(){
        if(!this.state.currentMusic.src){
            return
        }
        let current = ""
        this.props.info.forEach((v,i)=>{
            if (v.src === this.state.currentMusic.src){
                current = i
            }
        });
        if(current<this.props.info.length-1){
            this.setState({
                currentMusic:this.props.info[current+1]
            },()=>{
                this.play()
            })
        }else{
            this.setState({
                currentMusic:this.props.info[0]
            },()=>{
                this.play()
            })
        }

    }
    //点击设置进度条
    setTimeOnPc(e,flag){
        let audio = this.refs.audio;
        if(audio.currentTime !== 0) {
            let audio = this.refs.audio;
            let targetPoint = e.pageX - this.state.playedLeft;
            if(flag){
                targetPoint = e.pageX - this.state.detailPlayedLeft
            }
            let newWidth = targetPoint / this.refs.progress.offsetWidth;
            this.refs.played.style.width = newWidth * 100 + "%";
            audio.currentTime = newWidth * audio.duration;
        }

    }
    //
    clickChangeTime(e,flag){
        if(!e.pageX){
            return
        }
        this.setTimeOnPc(e,flag)
    }
    //滑动设置进度条
    startChangeTime(e,flag){
        if(this.refs.audio.currentTime !== 0) {
            this.setTime(e,flag)
        }
    }
    moveProgress(e,flag){

        let audio = this.refs.audio;
        if(audio.currentTime !== 0){
            this.setTime(e,flag)
        }
    }
    getTime(musicTime){
        if(musicTime){
            if(musicTime<60){
                musicTime = `00:${musicTime<10?`0${musicTime}`:musicTime}`
            }else{
                musicTime = `${parseInt(musicTime/60)<10?`0${parseInt(musicTime/60)}`:parseInt(musicTime/60)}:${musicTime%60<10?`0${musicTime%60}`:musicTime%60}`
            }
            return musicTime

        }else{
            return `00:00`
        }
    }
    setTime(e,flag){
        let audio = this.refs.audio;
        let targetPoint = e.touches[0].pageX-this.state.playedLeft
        if(flag){
            targetPoint = e.touches[0].pageX- this.state.detailPlayedLeft
        }
        let newWidth = targetPoint/this.refs.progress.offsetWidth;
        this.refs.played.style.width = newWidth*100 + "%";
        audio.currentTime = newWidth*audio.duration
    }
    /*移动端改变音量*/
    setVolume(pageX){
        let audio = this.refs.audio
        let volumeRate = (pageX-this.state.volumnLeft)/this.refs.totalVolume.offsetWidth;
        if(volumeRate>0.01 && volumeRate<=1){
            audio.volume = volumeRate
            this.refs.volumeProgress.style.width = volumeRate*100 + "%";
        }else if(volumeRate<=0.01){
            audio.volume = 0
        }else{
            audio.volume = 1
        }
    }
    startMoveVolume(e){
        if(this.refs.audio.currentTime !== 0) {
            this.setVolume(e.touches[0].pageX)
        }
    }
    moveVolume(e){
        if(this.refs.audio.currentTime !== 0) {
            this.setVolume(e.touches[0].pageX)
        }
    }
    //PC端改变音量
    clickChangeVolume(e){
        if(this.refs.audio.currentTime !== 0){
            this.setVolume(e.pageX)
        }
    }

    //展开播放列表
    showMusicList(){
        this.setState({
            musicListShow:!this.state.musicListShow
        })
    }
    playThis(i){
        this.setState({
            currentMusic:this.props.info[i]
        },()=>{
            this.play()
        })
    }
    delMusic(i,id){
        let audio = this.refs.audio;
        this.setState({})
        if(this.props.info[i].src === this.state.currentMusic.src){
            if(i<=this.props.info.length-1 && this.props.info[i+1]){
                this.setState({
                    currentMusic:this.props.info[i+1]
                },()=>{
                    this.play()
                    this.props.onDel(i,id);
                })
            }else if(!this.props.info[i+1] && this.props.info[i-1]){
                //都删除完了
                console.log(`山的是最后一条`)
                clearInterval(rotateTimer);

                this.setState({
                    currentMusic:this.props.info[0],
                },()=>{
                    this.play()
                })
                this.props.onDel(i,id);
            }else{
                //都删除完了
                console.log(`都删除完了`)
                clearInterval(rotateTimer);
                audio.currentTime = 0;
                this.refs.buffered.style.width = 0;
                this.refs.played.style.width = 0;
                this.setState({
                    currentMusic:{},
                    isPlayed:false,
                    musicListShow:false,

                },()=>{
                    this.props.onDel(i,id);
                })


            }
        }else{
            console.log(`删除的不是播放的`)
            this.props.onDel(i,id);

        }


    }

    //展示播放详情页
    playDetail(){
        this.setState({
            playDetail:true,
        },()=>{
            this.setState({
                detailPlayedLeft:this.refs.detailPlayed.getBoundingClientRect().left
            })
        })
    }
    hidePlayDetail(){
        this.setState({
            playDetail:false
        })
    }
    render() {

        return (
            <div id="react-music-player">
                <div className="react-music-player-wrapper">
                    <div className="react-music-player-inner" >
                        <div className="left-control">
                            <span className="icon-last" onClick={this.last}></span>
                            <span className={this.state.isPaused && this.state.currentMusic.src?"icon-pause":"icon-play"} onClick={this.play}></span>
                            <span className="icon-next" onClick={this.next}></span>
                        </div>
                        <div className="music-box">

                            <div className="picture" onClick={this.playDetail}>
                                {
                                    this.state.currentMusic.src?
                                        <img src={this.state.currentMusic.img} ref="musicAvatar" alt="图片丢失了"/>
                                        :
                                        <img className="album-bg" src={require('./little.png')} alt=""/>
                                }

                            </div>
                            <div className="music-info">
                                <div className="music-name">
                                    {
                                        this.state.currentMusic.src?(`${this.state.currentMusic.artist}：${this.state.currentMusic.name}`):`等待播放`
                                    }

                                </div>
                                <div className="progress-wrapper" ref="progress"
                                     onTouchMove={this.moveProgress}
                                     onTouchStart={this.startChangeTime}
                                     onClick={this.clickChangeTime}
                                >
                                    <div className="progress" >
                                        <div className="progress-buffered" ref="buffered" ></div>
                                        <div className="progress-played" ref="played"></div>
                                    </div>
                                </div>
                                <div className="time">

                                    <div className="remain-time">{this.state.currentMusic.src?this.state.playedTime:`00:00`}</div>
                                    <span>/</span>
                                    <div className="total-time">{this.state.currentMusic.src?this.state.totalTime:`00:00`}</div>

                                </div>
                            </div>
                        </div>
                        <div className="music-list-btn">
                            <span className="icon-menu" onClick={this.showMusicList}></span>
                        </div>

                        <div className="right-control">
                            <div className="volume-control-wrapper"
                                 onTouchMove={this.moveVolume}
                                 onTouchStart={this.startMoveVolume}
                                 onClick={this.clickChangeVolume}
                            >
                                <div className="volume-control" ref="totalVolume">
                                    <div className="volume-progress" ref="volumeProgress"></div>
                                </div>

                            </div>
                            <span className="icon-volume"></span>
                        </div>
                        <audio src={this.state.currentMusic.src?this.state.currentMusic.src:""} ref = "audio"></audio>
                    </div>
                </div>
                {/*播放列表*/}
                <ReactCSSTransitionGroup
                    transitionName="music-list-show"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}
                >
                    {
                        this.state.musicListShow?
                            <div className="music-list">
                                <div className="music-list-title">
                                    <span>播放列表</span>
                                </div>
                                <div className="single-music-wrapper">
                                    {
                                        this.props.info.map((v,i)=>{
                                            return (
                                                <div className="single-music" style={
                                                    this.state.currentMusic.src === v.src && this.state.isPlayed?{background: "#fec501",color:"#fff"}:null} key={v.src}>
                                                    <div className="single-music-play">
                                                        <span className={this.state.currentMusic.src === v .src && this.state.isPlayed?"icon-playing":"icon-play"} onClick={this.playThis.bind(this,i)}></span>
                                                    </div>
                                                    <div className="single-music-name">{v.name}</div>
                                                    <div className="single-music-artist">{v.artist}</div>
                                                    <div className="single-music-del">
                                                        <span className="icon-del" onClick={()=>{this.delMusic(i,v.id)}}></span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }

                                </div>
                            </div>
                            :
                            null
                    }

                </ReactCSSTransitionGroup>
                <ReactCSSTransitionGroup
                    transitionName="music-list-model"
                    transitionEnterTimeout={500}
                    transitionLeaveTimeout={300}
                >
                    {
                        this.state.musicListShow?
                            <div className="modal" onClick={this.showMusicList}></div>
                            :null
                    }
                </ReactCSSTransitionGroup>
                {/*播放详情*/}
                <ReactCSSTransitionGroup
                    transitionName="play-detail-show"
                    transitionEnterTimeout={300}
                    transitionLeaveTimeout={300}
                >
                    {
                        this.state.playDetail?
                            <div className="play-detail">
                                <div className="play-detail-wrapper">

                                    <div className="play-detail-img">
                                        <img className="album-bg" src={require('./album.png')} alt=""/>
                                        <img className="album-border" src={require('./album-border.png')} alt=""/>
                                        <div className="detailPic-wrapper">
                                            <img className="detailPic" ref="detailMusicImg" src={this.state.currentMusic.img} alt=""/>
                                        </div>


                                    </div>
                                    <div className="music-info">
                                        <div className="title">{this.state.currentMusic.name}</div>
                                        <div className="artist">{this.state.currentMusic.artist}</div>
                                    </div>
                                    <div className="operate">
                                        <div className="mode" onClick={this.playMode}>
                                            {this.state.mode}
                                        </div>
                                        <div className="operation">
                                            <span className="icon-last" onClick={this.last}></span>
                                            <span className={this.state.isPaused && this.state.currentMusic.src?"icon-pause":"icon-play"} onClick={this.play}></span>
                                            <span className="icon-next" onClick={this.next}></span>
                                        </div>
                                        <div className="close-detail" onClick={this.hidePlayDetail}>
                                            <img src={require('../../icons/close.png')} alt=""/>
                                        </div>
                                    </div>
                                    <div className="detail-progress" ref="progress"
                                         onTouchMove={(e)=>{this.moveProgress(e,"detail")}}
                                         onTouchStart={(e)=>{this.startChangeTime(e,"detail")}}
                                         onClick={(e)=>{this.clickChangeTime(e,"detail")}}
                                    >

                                        <div className="progress" >
                                            <div className="progress-buffered" style={{width:`${this.refs.buffered.style.width}`}} ></div>
                                            <div className="progress-played" ref="detailPlayed" style={{width:`${this.refs.played.style.width}`}}></div>
                                        </div>
                                    </div>
                                    <div className="detail-time">
                                        <div>{this.state.playedTime}</div>
                                        <div>{this.state.totalTime}</div>
                                    </div>
                                </div>
                            </div>
                            :
                            ""

                    }
                </ReactCSSTransitionGroup>

            </div>
        )
    }
}
export default Player