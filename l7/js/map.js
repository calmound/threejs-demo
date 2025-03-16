import { PointLayer, Scene } from "@antv/l7";
import { GaodeMap } from "@antv/l7-maps";

// 创建一个新的地图场景
const scene = new Scene({
  id: "map", // 地图容器的ID，对应HTML中的<div id="map"></div>元素
  map: new GaodeMap({
    style: "dark", // 地图样式，这里使用暗色主题
    center: [96.99215001469588, 29.281597225674773], // 地图中心点坐标，格式为[经度, 纬度]
    zoom: 2.194613775109773, // 地图缩放级别，数值越大表示放大程度越高
    maxZoom: 10, // 最大缩放级别，限制用户不能过度放大地图
  }),
});

// 监听地图场景加载完成事件
// 只有在地图完全加载后，才能添加数据图层和进行其他操作
scene.on("loaded", () => {
  // 从远程服务器获取GeoJSON格式的地理数据
  // 这里使用fetch API进行网络请求
  fetch(
    "https://gw.alipayobjects.com/os/basement_prod/337ddbb7-aa3f-4679-ab60-d64359241955.json"
  )
    .then((res) => res.json()) // 将响应转换为JSON格式
    .then((data) => {
      // 过滤数据，只保留capacity属性大于800的特征点
      // 这里的capacity可能表示城市人口、景点容量等数值
      data.features = data.features.filter((item) => {
        return item.properties.capacity > 800;
      });

      // 创建一个点图层用于展示数据
      const pointLayer = new PointLayer({})
        .source(data) // 设置数据源，使用上面获取并过滤后的GeoJSON数据
        .shape("circle") // 设置点的形状为圆形，L7还支持其他形状如square(方形)、triangle(三角形)等
        .size("capacity", [0, 16]) // 根据capacity属性值映射点的大小，范围从0到16像素
        .color("capacity", [
          // 根据capacity属性值映射点的颜色，使用渐变色
          "#34B6B7", // 最小值对应的颜色（青绿色）
          "#4AC5AF",
          "#5FD3A6",
          "#7BE39E",
          "#A1EDB8",
          "#CEF8D6", // 最大值对应的颜色（浅绿色）
        ])
        .active(true) // 启用交互功能，鼠标悬停或点击时会有反馈
        .style({
          opacity: 0.5, // 设置点的透明度为50%，使地图底图部分可见
          strokeWidth: 0, // 设置点的边框宽度为0，即没有边框
        });

      // 将创建好的点图层添加到地图场景中进行显示
      scene.addLayer(pointLayer);
    });
});
