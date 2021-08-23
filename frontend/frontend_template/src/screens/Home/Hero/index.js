import React, { useState } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import styles from "./Hero.module.sass";
import Icon from "../../../components/Icon";
import Player from "../../../components/Player";
import Modal from "../../../components/Modal";
import Connect from "../../../components/Connect";
import Switch from "../../../components/Switch";
import TextInput from "../../../components/TextInput";
// import Bid from "../../../components/Bid";

const items = [
  {
    title: "Song #2793",
    creator: "Jonathan Mann",
    currency: "1.00 ETH",
    price: ".1 ETH",
    avatar: "/images/content/avatar-creator.jpg",
    image: "/images/content/video-preview.jpg",
    image2x: "/images/content/video-preview@2x.jpg",
  }
  //
  // {
  //   title: "Marco carrillo®",
  //   creator: "Enrico Cole",
  //   currency: "2.00 ETH",
  //   price: "$2,477.92",
  //   avatar: "/images/content/avatar-creator.jpg",
  //   image: "/images/content/video-preview.jpg",
  //   image2x: "/images/content/video-preview@2x.jpg",
  // },
  // {
  //   title: "the creator network®",
  //   creator: "Enrico Cole",
  //   currency: "1.00 ETH",
  //   price: "$3,618.36",
  //   avatar: "/images/content/avatar-creator.jpg",
  //   image: "/images/content/video-preview.jpg",
  //   image2x: "/images/content/video-preview@2x.jpg",
  // },
  // {
  //   title: "Marco carrillo®",
  //   creator: "Enrico Cole",
  //   currency: "2.00 ETH",
  //   price: "$2,477.92",
  //   avatar: "/images/content/avatar-creator.jpg",
  //   image: "/images/content/video-preview.jpg",
  //   image2x: "/images/content/video-preview@2x.jpg",
  // },
];

const SlickArrow = ({ currentSlide, slideCount, children, ...props }) => (
  <button {...props}>{children}</button>
);

const Hero = ({state}) => {
  const settings = {
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    nextArrow: (
      <SlickArrow>
        <Icon name="arrow-next" size="14" />
      </SlickArrow>
    ),
    prevArrow: (
      <SlickArrow>
        <Icon name="arrow-prev" size="14" />
      </SlickArrow>
    ),
  };

  const [visibleModalBid, setVisibleModalBid] = useState(false);

  const [isConnected, setIsConnected] = useState(!!state.selectedAddress);

  return (
    <>
      <div>
        <div className={cn("container", styles.container)}>
          <div className={styles.headALT}>
            <h2 className={cn("h2", styles.title)}>
              THIS IS PUBLIC PROPERTY
            </h2>
            <div className={styles.stage2}>
              Create, explore, & collect digital art NFTs.
            </div>
            {/*<Link className={cn("button-stroke", styles.button)} to="/search01">*/}
              {/*Start your search*/}
            {/*</Link>*/}
          </div>
          <div className={styles.wrapper}>
            {/*<Slider className="creative-slider" {...settings}>*/}
              {items.map((x, index) => (
                <div className={styles.slide} key={index}>
                  <div className={styles.row}>
                    <Player className={styles.player} item={x} />
                    <div className={styles.details}>
                      <div className={cn("h3", styles.subtitle)}>{x.title}</div>
                      <div className={styles.line}>
                        <div className={styles.item}>
                          <div className={styles.avatar}>
                            <img src={x.avatar} alt="Avatar" />
                          </div>
                          <div className={styles.description}>
                            <div className={styles.category}>Creator</div>
                            <div className={styles.text}>{x.creator}</div>
                          </div>
                        </div>
                        <div className={styles.item}>
                          <div className={styles.icon}>
                            <Icon name="stop" size="24" />
                          </div>
                          <div className={styles.description}>
                            <div className={styles.category}>Tax Rate</div>
                            <div className={styles.text}>10% Annual</div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.wrap}>
                        <div className={styles.info}>Current Bid</div>
                        <div className={styles.currency}>{x.currency}</div>
                        <div className={styles.price}>Annual Tax: {x.price}</div>
                        <div className={styles.info}>Auction ending in</div>
                        <div className={styles.timer}>
                          <div className={styles.box}>
                            <div className={styles.number}>19</div>
                            <div className={styles.time}>Hrs</div>
                          </div>
                          <div className={styles.box}>
                            <div className={styles.number}>24</div>
                            <div className={styles.time}>mins</div>
                          </div>
                          <div className={styles.box}>
                            <div className={styles.number}>19</div>
                            <div className={styles.time}>secs</div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.btns}>
                        <button
                          className={cn("button", styles.button)}
                          onClick={() => setVisibleModalBid(true)}
                        >
                          Place a bid
                        </button>
                        <Link
                          className={cn("button-stroke", styles.button)}
                          to="/item"
                        >
                          View item
                        </Link>

                        <div>
                        connect <Switch value={isConnected} setValue={setIsConnected} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            {/*</Slider>*/}
          </div>
        </div>
      </div>
      <Modal
        visible={visibleModalBid}
        onClose={() => setVisibleModalBid(false)}
      >
        {!isConnected ?
          <Connect state={state}/> :
          <form>
            <div className={styles.formItem}>
              <div className={styles.fieldset}>
                <TextInput
                  className={styles.field}
                  label="Bid"
                  name="Bid"
                  type="text"
                  placeholder='place bid here'
                  required
                />
                <div className={styles.btns}>
                  <button className={cn("button", styles.button)}>Submit Bid</button>
                </div>
              </div>
            </div>
          </form>
        }
      </Modal>
    </>
  );
};

export default Hero;
