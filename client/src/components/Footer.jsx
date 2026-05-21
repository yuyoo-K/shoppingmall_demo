/** 쇼핑몰 하단 푸터 */
function Footer() {
  return (
    <footer className="mall-footer">
      <div className="mall-footer__inner">
        <div className="mall-footer__col">
          <p className="mall-footer__brand">ShopingMall</p>
          <p className="mall-footer__text">
            서울특별시 강남구 테헤란로 123
            <br />
            대표: 홍길동 | 사업자등록번호: 123-45-67890
            <br />
            고객센터: 02-1234-5678 | shop@shopingmall.com
          </p>
        </div>
        <div className="mall-footer__col">
          <p className="mall-footer__title">바로가기</p>
          <ul className="mall-footer__links">
            <li>소개</li>
            <li>쇼핑</li>
            <li>커뮤니티</li>
            <li>클래스</li>
            <li>이용안내</li>
          </ul>
        </div>
        <div className="mall-footer__col mall-footer__col--social">
          <p className="mall-footer__title">소셜 미디어</p>
          <div className="mall-footer__social">
            <span>f</span>
            <span>in</span>
            <span>ig</span>
            <span>yt</span>
          </div>
        </div>
      </div>
      <p className="mall-footer__copy">© ShopingMall. All rights reserved.</p>
    </footer>
  )
}

export default Footer
