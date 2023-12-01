export interface IProps {
  className?: string;
  width?: string;
  height?: string;
}
export function Logo(props: IProps) {
  const { className = '', width = '154px', height = '116px' } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 154 116"
      className={className}
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <title>Libro logo</title>
      <g id="页面-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="画板备份-6" transform="translate(-119.000000, -152.000000)">
          <g id="Libro-logo" transform="translate(119.000000, 152.000000)">
            <path
              d="M128.970588,66 C142.793951,66 154,77.1926795 154,90.9995493 C154,104.806419 142.793951,115.999099 128.970588,115.999099 C128.473758,115.999099 127.980309,115.98464 127.49064,115.956121 L127.697007,115.999674 L80,115.999099 L93.1090651,98.1074032 L108.158627,77.1069733 C112.649045,70.4093826 120.294268,66 128.970588,66 Z"
              id="形状结合"
              fill="#155DE2"
            ></path>
            <path
              d="M104.481034,0 L147,0 L147,0 L59.3397468,116 L0,116 L78.0248494,13.1382037 C84.3029962,4.8615911 94.0927023,-5.19712172e-15 104.481034,0 Z"
              id="矩形"
              fill="#155DE2"
            ></path>
            <path
              d="M65.667264,51.1430655 C65.667264,84.8453007 91.2203312,112.576275 123.999729,115.999972 L0,115.997535 L75.3014571,17.0042341 C69.1915639,26.9341621 65.667264,38.6268332 65.667264,51.1430655 Z"
              id="形状结合"
              fill="#12D8C6"
            ></path>
          </g>
        </g>
      </g>
    </svg>
  );
}
