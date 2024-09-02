/*
将字典值转换成字典label
dict:字典
colors:值对应要显示的颜色
v:要转换的值
def:默认值
 */
export function transDict(dict,colors,v,def){
  for(var o in dict){
    if(dict[o].value === v) {
      if(colors){
        return `<span style="color:${colors[v]}">${dict[o].label}</span>`;
      }else{
        return `<span>${dict[o].label}</span>`;
      }
    }
  }
  if(colors){
    return `<span style="color:${colors['def']}">${def}</span>`;
  }
  return def;
}
