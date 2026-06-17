import type { User, Venue, PriceConfig, Service, Booking, Review, TimeSlot, VenueType, ServiceCategory, SelectedService } from '../shared/types.js';

const img = (prompt: string): string =>
  `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=square_hd`;

export const mockUsers: User[] = [
  { id: 'host1', role: 'host', name: '华盛宴会厅', email: 'host1@venue.com', phone: '13800138001', company: '华盛酒店管理集团', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'host2', role: 'host', name: '会展中心', email: 'host2@venue.com', phone: '13800138002', company: '国际会展有限公司', createdAt: '2024-01-02T00:00:00Z' },
  { id: 'cust1', role: 'customer', name: '张先生', email: 'cust1@test.com', phone: '13900139001', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'cust2', role: 'customer', name: '李女士', email: 'cust2@test.com', phone: '13900139002', createdAt: '2024-02-02T00:00:00Z' },
  { id: 'admin1', role: 'admin', name: '平台管理员', email: 'admin@venue.com', phone: '13000130001', createdAt: '2024-01-01T00:00:00Z' },
];

export const mockVenues: Venue[] = [
  {
    id: 'venue1', hostId: 'host1', name: '华盛水晶宴会厅', type: 'banquet', city: '上海',
    address: '浦东新区陆家嘴环路1000号', area: 1200, capacity: 500, height: 8,
    description: '五星级酒店宴会厅，可承办婚宴、年会、发布会等各类大型活动',
    facilities: ['舞台', '灯光', '音响', '投影', '化妆间', '停车场', 'WIFI'],
    images: [img('luxury banquet hall with crystal chandeliers elegant interior'), img('grand ballroom wedding venue interior design')],
    styleImages: [
      { name: '中式婚礼', url: img('chinese traditional wedding venue decoration red theme') },
      { name: '西式婚礼', url: img('western wedding venue white flowers elegant') },
      { name: '企业年会', url: img('corporate annual gala dinner stage lighting') },
    ],
    basePrice: 28000, rating: 4.8, reviewCount: 56, status: 'published', createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'venue2', hostId: 'host1', name: '璀璨花园宴会厅', type: 'banquet', city: '北京',
    address: '朝阳区建国路88号', area: 800, capacity: 350, height: 6,
    description: '欧式花园风格宴会厅，环境优雅，适合举办婚礼和高端商务活动',
    facilities: ['舞台', '灯光', '音响', '投影', '化妆间', '停车场', 'WIFI', '空调', '桌椅'],
    images: [img('elegant garden banquet hall european style interior'), img('luxury wedding reception hall with garden view')],
    styleImages: [
      { name: '花园婚礼', url: img('garden wedding venue with flowers and greenery') },
      { name: '晚宴布置', url: img('elegant dinner party setup with round tables') },
    ],
    basePrice: 22000, rating: 4.6, reviewCount: 38, status: 'published', createdAt: '2024-03-05T00:00:00Z',
  },
  {
    id: 'venue3', hostId: 'host2', name: '国际会展中心A馆', type: 'exhibition', city: '上海',
    address: '徐汇区漕宝路88号', area: 3000, capacity: 2000, height: 12,
    description: '大型专业展览馆，可举办大型展会、博览会、新品发布会等活动',
    facilities: ['舞台', '灯光', '音响', '投影', '停车场', 'WIFI', '空调', '电梯', '无障碍通道', '电源接口'],
    images: [img('large exhibition hall interior with modern design'), img('professional trade show venue empty space')],
    styleImages: [
      { name: '展会布置', url: img('exhibition booth setup trade show event') },
      { name: '发布会', url: img('product launch event stage with large screen') },
    ],
    basePrice: 50000, rating: 4.5, reviewCount: 24, status: 'published', createdAt: '2024-03-10T00:00:00Z',
  },
  {
    id: 'venue4', hostId: 'host2', name: '湖畔户外草坪', type: 'outdoor', city: '杭州',
    address: '西湖区龙井路1号', area: 2000, capacity: 300, height: undefined,
    description: '紧邻西湖的户外草坪场地，风景优美，适合举办户外婚礼、派对和团建活动',
    facilities: ['舞台', '灯光', '音响', '停车场', 'WIFI', '桌椅'],
    images: [img('outdoor lawn venue by lake with beautiful scenery'), img('garden wedding venue with lake view')],
    styleImages: [
      { name: '户外婚礼', url: img('outdoor wedding ceremony on lawn by lake') },
      { name: '团建活动', url: img('corporate team building event outdoor lawn') },
    ],
    basePrice: 15000, rating: 4.7, reviewCount: 42, status: 'published', createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'venue5', hostId: 'host1', name: '云顶国际会议中心', type: 'conference', city: '深圳',
    address: '福田区深南大道6008号', area: 1500, capacity: 800, height: 5,
    description: '现代化专业会议中心，配备先进的音视频设备，适合举办各类会议和论坛',
    facilities: ['舞台', '灯光', '音响', '投影', '化妆间', '停车场', 'WIFI', '空调', '桌椅', '电梯', '无障碍通道', '电源接口'],
    images: [img('modern conference center interior with auditorium'), img('professional meeting room with stage and seats')],
    styleImages: [
      { name: '大型会议', url: img('large business conference with audience on stage') },
      { name: '论坛活动', url: img('business forum panel discussion on stage') },
    ],
    basePrice: 35000, rating: 4.4, reviewCount: 31, status: 'published', createdAt: '2024-03-20T00:00:00Z',
  },
  {
    id: 'venue6', hostId: 'host2', name: '艺术空间创意馆', type: 'other', city: '北京',
    address: '海淀区中关村大街1号', area: 600, capacity: 200, height: 4.5,
    description: '工业风艺术空间，可灵活布置，适合举办艺术展览、创意活动、小型发布会等',
    facilities: ['灯光', '音响', '投影', '停车场', 'WIFI', '空调', '电源接口'],
    images: [img('industrial style art space creative venue interior'), img('modern exhibition space with white walls')],
    styleImages: [
      { name: '艺术展览', url: img('art exhibition gallery space with paintings') },
      { name: '创意活动', url: img('creative workshop event in modern space') },
    ],
    basePrice: 12000, rating: 4.3, reviewCount: 18, status: 'published', createdAt: '2024-03-25T00:00:00Z',
  },
];

const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'evening', 'fullDay'];
const holidays: string[] = ['2026-06-18', '2026-07-01', '2026-10-01', '2026-10-02', '2026-10-03'];

function getDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(dateStr: string): boolean {
  return holidays.includes(dateStr);
}

function calculatePrice(basePrice: number, date: Date, timeSlot: TimeSlot, isHolidayFlag: boolean, isWeekendFlag: boolean): number {
  let multiplier = 1;
  if (isWeekendFlag) multiplier *= 1.2;
  if (isHolidayFlag) multiplier *= 1.5;
  if (timeSlot === 'fullDay') multiplier *= 2.5;
  else if (timeSlot === 'evening') multiplier *= 1.3;
  else if (timeSlot === 'afternoon') multiplier *= 1.1;
  return Math.round(basePrice * multiplier / 100) * 100;
}

export function generatePriceConfigs(venues: Venue[]): PriceConfig[] {
  const configs: PriceConfig[] = [];
  let id = 1;
  const today = new Date('2026-06-17');

  for (const venue of venues) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = getDateStr(date);
      const weekend = isWeekend(date);
      const holiday = isHoliday(dateStr);

      for (const slot of timeSlots) {
        configs.push({
          id: `price${id++}`,
          venueId: venue.id,
          date: dateStr,
          timeSlot: slot,
          price: calculatePrice(venue.basePrice, date, slot, holiday, weekend),
          isHoliday: holiday,
          isWeekend: weekend,
        });
      }
    }
  }
  return configs;
}

export const mockPriceConfigs: PriceConfig[] = generatePriceConfigs(mockVenues);

interface ServiceTemplate {
  category: ServiceCategory;
  name: string;
  unit: string;
  description: string;
  basePrice: number;
}

const serviceTemplatesByVenue: Record<string, ServiceTemplate[]> = {
  venue1: [
    { category: 'catering', name: '中式婚宴套餐', unit: '桌', description: '精致中式菜肴，10人/桌，含冷盘、热菜、汤品、主食、甜品', basePrice: 3888 },
    { category: 'decoration', name: '婚礼花艺布置', unit: '套', description: '婚礼全场花艺布置，含迎宾区、仪式区、餐桌花艺', basePrice: 8000 },
    { category: 'other', name: '摄影摄像服务', unit: '场', description: '专业摄影师全程跟拍，精修照片50张，全程录像剪辑', basePrice: 6000 },
    { category: 'other', name: '主持人服务', unit: '场', description: '专业活动主持人，含前期沟通、流程策划、现场主持', basePrice: 5000 },
    { category: 'audio', name: '专业音响系统', unit: '套', description: '专业线阵音响系统，含无线话筒4支、调音台、专业音效师', basePrice: 5000 },
  ],
  venue2: [
    { category: 'catering', name: '西式自助餐', unit: '人', description: '精选西式自助餐，开胃菜、主菜、甜点、饮品无限供应', basePrice: 298 },
    { category: 'audio', name: '专业音响系统', unit: '套', description: '专业线阵音响系统，含无线话筒4支、调音台、专业音效师', basePrice: 5000 },
    { category: 'decoration', name: '灯光设计服务', unit: '套', description: '专业灯光设计+现场执行，营造完美氛围', basePrice: 8000 },
    { category: 'catering', name: '鸡尾酒会', unit: '人', description: '精选鸡尾酒、葡萄酒、小食拼盘，适合商务招待和社交活动', basePrice: 198 },
  ],
  venue3: [
    { category: 'audio', name: 'LED大屏租赁', unit: '平米', description: 'P3高清LED显示屏，可定制尺寸，含安装调试', basePrice: 800 },
    { category: 'audio', name: '同声传译设备', unit: '套', description: '专业同声传译系统，含翻译间、接收机200台、技术支持', basePrice: 15000 },
    { category: 'catering', name: '茶歇服务', unit: '人', description: '精致茶点、咖啡、茶饮，适合会议和活动中场休息', basePrice: 88 },
    { category: 'decoration', name: '舞台背景搭建', unit: '套', description: '专业舞台背景板搭建，含喷绘画面、灯光效果', basePrice: 10000 },
  ],
  venue4: [
    { category: 'decoration', name: '婚礼花艺布置', unit: '套', description: '婚礼全场花艺布置，含迎宾区、仪式区、餐桌花艺', basePrice: 8000 },
    { category: 'catering', name: '西式自助餐', unit: '人', description: '精选西式自助餐，开胃菜、主菜、甜点、饮品无限供应', basePrice: 268 },
    { category: 'audio', name: '专业音响系统', unit: '套', description: '专业线阵音响系统，含无线话筒4支、调音台、专业音效师', basePrice: 5000 },
    { category: 'other', name: '摄影摄像服务', unit: '场', description: '专业摄影师全程跟拍，精修照片50张，全程录像剪辑', basePrice: 6000 },
  ],
  venue5: [
    { category: 'audio', name: '同声传译设备', unit: '套', description: '专业同声传译系统，含翻译间、接收机200台、技术支持', basePrice: 15000 },
    { category: 'catering', name: '茶歇服务', unit: '人', description: '精致茶点、咖啡、茶饮，适合会议和活动中场休息', basePrice: 88 },
    { category: 'audio', name: '高清投影设备', unit: '套', description: '10000流明高清投影机+200寸电动幕布，含专业操作人员', basePrice: 5000 },
    { category: 'other', name: '活动策划', unit: '套', description: '专业活动策划团队，提供方案设计、流程规划、现场执行', basePrice: 12000 },
  ],
  venue6: [
    { category: 'decoration', name: '气球装饰', unit: '套', description: '创意气球装饰布置，适合生日派对、宝宝宴、活动庆典', basePrice: 5000 },
    { category: 'other', name: '摄影摄像服务', unit: '场', description: '专业摄影师全程跟拍，精修照片50张，全程录像剪辑', basePrice: 6000 },
    { category: 'audio', name: '专业音响系统', unit: '套', description: '专业线阵音响系统，含无线话筒4支、调音台、专业音效师', basePrice: 5000 },
    { category: 'catering', name: '茶歇服务', unit: '人', description: '精致茶点、咖啡、茶饮，适合会议和活动中场休息', basePrice: 88 },
  ],
};

export function generateServices(venues: Venue[]): Service[] {
  const services: Service[] = [];
  let id = 1;

  for (const venue of venues) {
    const templates = serviceTemplatesByVenue[venue.id] || [];
    for (const tpl of templates) {
      services.push({
        id: `service${id++}`,
        venueId: venue.id,
        name: tpl.name,
        category: tpl.category,
        price: tpl.basePrice + Math.floor(Math.random() * 2000),
        unit: tpl.unit,
        description: tpl.description,
        image: img(`${tpl.category} ${tpl.name} service event`),
      });
    }
  }
  return services;
}

export const mockServices: Service[] = generateServices(mockVenues);

function getServiceIdsByVenue(venueId: string, services: Service[]): string[] {
  return services.filter(s => s.venueId === venueId).map(s => s.id);
}

const servicesForBookings = mockServices;

const venue1Services = getServiceIdsByVenue('venue1', servicesForBookings);
const venue2Services = getServiceIdsByVenue('venue2', servicesForBookings);
const venue3Services = getServiceIdsByVenue('venue3', servicesForBookings);
const venue4Services = getServiceIdsByVenue('venue4', servicesForBookings);
const venue5Services = getServiceIdsByVenue('venue5', servicesForBookings);
const venue6Services = getServiceIdsByVenue('venue6', servicesForBookings);

function randomDateFuture(days: number): string {
  const date = new Date('2026-06-17');
  date.setDate(date.getDate() + Math.floor(Math.random() * days) + 1);
  return getDateStr(date);
}

function randomDatePast(days: number): string {
  const date = new Date('2026-06-17');
  date.setDate(date.getDate() - Math.floor(Math.random() * days) - 1);
  return getDateStr(date);
}

export const mockBookings: Booking[] = [
  {
    id: 'booking1', venueId: 'venue1', userId: 'cust1', date: randomDateFuture(15),
    timeSlot: 'fullDay', eventType: '婚礼婚宴', estimatedPeople: 300,
    specialRequirements: '需要中式婚礼布置，红色主题',
    selectedServices: [{ serviceId: venue1Services[0], quantity: 30 }, { serviceId: venue1Services[1], quantity: 1 }] as SelectedService[],
    totalAmount: 128000, deposit: 38400, status: 'completed',
    hostReply: '已确认，期待为您服务', createdAt: '2026-04-01T10:00:00Z',
  },
  {
    id: 'booking2', venueId: 'venue2', userId: 'cust2', date: randomDateFuture(20),
    timeSlot: 'evening', eventType: '企业年会', estimatedPeople: 200,
    specialRequirements: '需要舞台和音响设备，提供自助餐',
    selectedServices: [{ serviceId: venue2Services[1], quantity: 1 }, { serviceId: venue2Services[0], quantity: 200 }] as SelectedService[],
    totalAmount: 85000, deposit: 25500, status: 'confirmed',
    hostReply: '已安排，详情请见邮件', createdAt: '2026-04-15T14:30:00Z',
  },
  {
    id: 'booking3', venueId: 'venue3', userId: 'cust1', date: randomDateFuture(25),
    timeSlot: 'fullDay', eventType: '产品发布会', estimatedPeople: 500,
    specialRequirements: '需要LED大屏和同声传译设备',
    selectedServices: [{ serviceId: venue3Services[0], quantity: 30 }, { serviceId: venue3Services[1], quantity: 1 }] as SelectedService[],
    totalAmount: 180000, deposit: 54000, status: 'depositPaid',
    hostReply: '定金已收到，正在准备方案', createdAt: '2026-05-01T09:00:00Z',
  },
  {
    id: 'booking4', venueId: 'venue4', userId: 'cust2', date: randomDateFuture(10),
    timeSlot: 'afternoon', eventType: '婚礼婚宴', estimatedPeople: 150,
    specialRequirements: '户外草坪婚礼，需要花艺布置',
    selectedServices: [{ serviceId: venue4Services[0], quantity: 1 }] as SelectedService[],
    totalAmount: 45000, deposit: 13500, status: 'approved',
    hostReply: '已审核通过，请尽快支付定金', createdAt: '2026-05-10T11:20:00Z',
  },
  {
    id: 'booking5', venueId: 'venue5', userId: 'cust1', date: randomDateFuture(5),
    timeSlot: 'morning', eventType: '学术会议', estimatedPeople: 300,
    specialRequirements: '需要同声传译设备和茶歇服务',
    selectedServices: [{ serviceId: venue5Services[0], quantity: 1 }, { serviceId: venue5Services[1], quantity: 300 }] as SelectedService[],
    totalAmount: 68000, deposit: 20400, status: 'pending',
    createdAt: '2026-06-15T16:00:00Z',
  },
  {
    id: 'booking6', venueId: 'venue1', userId: 'cust2', date: randomDatePast(30),
    timeSlot: 'fullDay', eventType: '婚礼婚宴', estimatedPeople: 400,
    specialRequirements: '豪华婚礼布置',
    selectedServices: [{ serviceId: venue1Services[0], quantity: 40 }, { serviceId: venue1Services[1], quantity: 1 }] as SelectedService[],
    totalAmount: 168000, deposit: 50400, status: 'completed',
    hostReply: '圆满完成，祝您幸福', createdAt: '2026-04-20T08:00:00Z',
  },
  {
    id: 'booking7', venueId: 'venue6', userId: 'cust1', date: randomDateFuture(12),
    timeSlot: 'evening', eventType: '生日派对', estimatedPeople: 80,
    specialRequirements: '需要气球装饰和摄影服务',
    selectedServices: [{ serviceId: venue6Services[0], quantity: 1 }, { serviceId: venue6Services[1], quantity: 1 }] as SelectedService[],
    totalAmount: 28000, deposit: 8400, status: 'depositPaid',
    hostReply: '定金已收到，期待您的光临', createdAt: '2026-05-20T13:00:00Z',
  },
  {
    id: 'booking8', venueId: 'venue3', userId: 'cust2', date: randomDatePast(45),
    timeSlot: 'fullDay', eventType: '展览展会', estimatedPeople: 1500,
    specialRequirements: '大型展览场地布置',
    selectedServices: [{ serviceId: venue3Services[0], quantity: 50 }] as SelectedService[],
    totalAmount: 250000, deposit: 75000, status: 'completed',
    hostReply: '展会圆满成功', createdAt: '2026-03-15T09:30:00Z',
  },
  {
    id: 'booking9', venueId: 'venue5', userId: 'cust1', date: randomDateFuture(8),
    timeSlot: 'fullDay', eventType: '培训讲座', estimatedPeople: 200,
    specialRequirements: '需要投影和音响设备',
    selectedServices: [{ serviceId: venue5Services[2], quantity: 1 }, { serviceId: venue5Services[1], quantity: 200 }] as SelectedService[],
    totalAmount: 55000, deposit: 16500, status: 'confirmed',
    hostReply: '已确认，设备已安排', createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'booking10', venueId: 'venue2', userId: 'cust2', date: randomDatePast(20),
    timeSlot: 'evening', eventType: '团建活动', estimatedPeople: 100,
    specialRequirements: '需要餐饮和场地布置',
    selectedServices: [{ serviceId: venue2Services[3], quantity: 100 }, { serviceId: venue2Services[2], quantity: 1 }] as SelectedService[],
    totalAmount: 42000, deposit: 12600, status: 'completed',
    hostReply: '活动顺利完成', createdAt: '2026-05-05T15:00:00Z',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review1', bookingId: 'booking1', venueId: 'venue1', userId: 'cust1',
    rating: 5, content: '场地非常漂亮，服务也很周到，婚礼办得很成功，亲朋好友都赞不绝口！强烈推荐！',
    hostReply: '感谢您的好评，祝您新婚快乐，永远幸福！',
    createdAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'review2', bookingId: 'booking6', venueId: 'venue1', userId: 'cust2',
    rating: 5, content: '水晶宴会厅名不虚传，场地宽敞明亮，布置精美，餐饮也很棒。整个团队服务态度非常好，从前期沟通到现场执行都很专业。',
    hostReply: '非常感谢您的认可，期待再次为您服务！',
    createdAt: '2026-05-25T14:00:00Z',
  },
  {
    id: 'review3', bookingId: 'booking8', venueId: 'venue3', userId: 'cust2',
    rating: 4, content: '展览场地很大，设施齐全，适合大型展会。唯一的缺点是停车位有点紧张，建议提前安排。',
    hostReply: '感谢您的反馈，我们已在协调更多停车位，期待下次合作！',
    createdAt: '2026-05-05T11:00:00Z',
  },
  {
    id: 'review4', bookingId: 'booking10', venueId: 'venue2', userId: 'cust2',
    rating: 5, content: '公司团建选在这里，环境很好，服务人员都很热情，餐饮品质也不错。大家玩得很开心，下次活动还会考虑这里。',
    createdAt: '2026-05-28T16:00:00Z',
  },
  {
    id: 'review5', bookingId: 'booking1', venueId: 'venue1', userId: 'cust1',
    rating: 5, content: '补充一下，摄影团队拍的照片非常棒，把我们的婚礼最美的瞬间都记录下来了，真的很感谢！',
    userReply: '再次感谢您的肯定，这是我们应该做的~',
    createdAt: '2026-05-22T09:00:00Z',
  },
];
