import React, {Component} from 'react';
import { Carousel } from 'antd-mobile';
import WhiteSpace from '../../components/whiteSpace'
import Title from '../../components/title';
import SongsList from '../../components/songs-list/songs-list'
import {fetchBanner,fetchRecommend,fetchReSongsData} from '../../redux/repertoire.redux';
import { connect } from 'react-redux';
import './repertoire.less';
@connect(
    state=>state.repertoire,
    {fetchBanner,fetchRecommend,fetchReSongsData}
)
class Repertoire extends Component {
    constructor(props) {
        super(props)
        this.state = {
            data:this.props.bannerData
        };
    }
    componentDidMount(){
        this.props.fetchBanner();
        this.props.fetchRecommend();
        this.props.fetchReSongsData()
    }

    render() {
        return (
            <div id="repertoire">
                <div className="banner">
                    <Carousel
                        autoplay={true}
                        infinite
                        selectedIndex={1}
                        beforeChange={(from, to) => console.log(`slide from ${from} to ${to}`)}
                        afterChange={index => console.log('slide to', index)}
                    >
                        {this.props.bannerData.map(val => (
                            <a
                                key={val}
                                href="##"
                                style={{ display: 'inline-block', width: '100%'}}
                            >
                                <img
                                    src={val}
                                    alt=""
                                    className="banner-img"
                                    onLoad={() => {
                                        // fire window resize event to change height
                                        window.dispatchEvent(new Event('resize'));
                                        this.setState({ imgHeight: 'auto' });
                                    }}
                                />
                            </a>
                        ))}
                    </Carousel>
                </div>
                <WhiteSpace></WhiteSpace>
                <div className="recommend">
                    <Title title="每日推荐"></Title>
                    <div className="recommend-wrapper">
                        {
                            this.props.recommendData.map(v=>(
                                <div key={v.src} className="recommend-item">
                                    <div>
                                        <img src={v.src} alt=""/>
                                    </div>
                                    <div className="item-name">{v.name}</div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <WhiteSpace></WhiteSpace>
                <div className="songs">
                    <Title title="曲库好歌"></Title>
                    <SongsList songs={this.props.reSongsData}></SongsList>
                </div>
            </div>
        )
    }
}
export default Repertoire