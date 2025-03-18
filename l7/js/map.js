import { RasterLayer, PointLayer, Scene } from "@antv/l7";
import { Map } from "@antv/l7-maps";

// 创建地图场景
const scene = new Scene({
  id: "map", // 指定地图容器的 HTML 元素 ID
  map: new Map({
    center: [105.0, 35.0], // 设置地图中心点为中国的大致中心位置，经度105度，纬度35度
    zoom: 3, // 初始缩放级别，值越大显示的区域越详细
    minZoom: 3, // 最小缩放级别，防止用户过度缩小地图
    maxZoom: 18, // 最大缩放级别，防止用户过度放大地图
  }),
});

// 监听地图加载完成事件，添加底图图层
scene.on("loaded", () => {
  // 创建栅格图层作为地图底图
  const layer = new RasterLayer();
  // 设置图层数据源为高德地图的瓦片服务
  // 这里使用的是高德地图的免费瓦片服务，不需要 API Key
  // {1-3} 表示会随机使用 1、2、3 三个服务器以分散负载
  // {x}、{y}、{z} 是瓦片坐标和缩放级别的占位符，会在请求时被替换为实际值
  layer.source(
    "https://webrd0{1-3}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    {
      parser: {
        type: "rasterTile", // 指定数据类型为栅格瓦片
        tileSize: 256, // 瓦片大小，标准为 256x256 像素
        minZoom: 2, // 瓦片服务支持的最小缩放级别
        maxZoom: 18, // 瓦片服务支持的最大缩放级别
      },
    }
  );
  // 将底图图层添加到场景中
  scene.addLayer(layer);
});

// 监听地图场景加载完成事件，添加数据图层
// 注意：这里有两个 loaded 事件监听器，第一个用于添加底图，第二个用于添加数据点
scene.on("loaded", () => {
  // 从远程服务器获取 GeoJSON 格式的地理数据
  // 这里使用 fetch API 进行网络请求
  fetch(
    "https://gw.alipayobjects.com/os/basement_prod/337ddbb7-aa3f-4679-ab60-d64359241955.json"
  )
    .then((res) => res.json()) // 将响应转换为 JSON 格式
    .then((data) => {
      // 过滤数据，只保留 capacity 属性大于 800 的特征点
      // 这里的 capacity 可能表示城市人口、景点容量等数值
      data.features = data.features.filter((item) => {
        return item.properties.capacity > 800;
      });

      // 创建一个点图层用于展示数据
      const pointLayer = new PointLayer({})
        .source(data) // 设置数据源，使用上面获取并过滤后的 GeoJSON 数据
        .shape("circle") // 设置点的形状为圆形，L7 还支持其他形状如 square(方形)、triangle(三角形)等
        .size("capacity", [0, 16]) // 根据 capacity 属性值映射点的大小，范围从 0 到 16 像素
        .color("capacity", [
          // 根据 capacity 属性值映射点的颜色，使用渐变色
          "#FF5733", // 橙红色
          "#FF7F50", // 珊瑚色
          "#FFA07A", // 浅鲑鱼色
          "#FFBF00", // 琥珀色
          "#FFD700", // 金色
          "#FFFF00", // 黄色
        ])
        .active(true) // 启用交互功能，鼠标悬停或点击时会有反馈
        .style({
          opacity: 0.8, // 增加不透明度，使气泡在地图上更加醒目
          strokeWidth: 1, // 添加细边框，增强可见性
        });

      // 将创建好的点图层添加到地图场景中进行显示
      scene.addLayer(pointLayer);
    });
});
