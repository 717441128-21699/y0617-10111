import { Link } from 'react-router-dom';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    产品服务: [
      { name: '场地预订', path: '/venues' },
      { name: '增值服务', path: '/services' },
      { name: '价格方案', path: '/pricing' },
      { name: '常见问题', path: '/faq' },
    ],
    关于我们: [
      { name: '公司简介', path: '/about' },
      { name: '加入我们', path: '/careers' },
      { name: '新闻动态', path: '/news' },
      { name: '合作伙伴', path: '/partners' },
    ],
    帮助支持: [
      { name: '帮助中心', path: '/help' },
      { name: '用户协议', path: '/terms' },
      { name: '隐私政策', path: '/privacy' },
      { name: '联系客服', path: '/contact' },
    ],
  };

  const socialLinks = [
    { name: '微信', icon: Facebook, href: '#' },
    { name: '微博', icon: Twitter, href: '#' },
    { name: '小红书', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-primary-700 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <Building2 className="w-6 h-6 text-accent-gold" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-xl font-bold">悦场</span>
                <span className="text-xs text-primary-200 font-medium tracking-wider">VENUEHUB</span>
              </div>
            </Link>
            <p className="text-primary-200 text-sm leading-relaxed mb-6 max-w-sm">
              悦场 VenueHub 是国内领先的活动场地预订平台，连接优质场地方与活动主办方，
              让每场活动都成为难忘的体验。
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-primary-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-accent-gold" />
                </div>
                <span>400-888-8888</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-accent-gold" />
                </div>
                <span>contact@venuehub.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-primary-200">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-accent-gold" />
                </div>
                <span>上海市浦东新区世纪大道 100 号</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-5 tracking-wide">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-primary-200 hover:text-accent-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-primary-300">
            © {currentYear} 悦场 VenueHub. All rights reserved. 沪ICP备 12345678 号
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-primary-200 hover:bg-accent-gold hover:text-primary-700 transition-all"
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
