import React, { useEffect, useState } from 'react'
import { a, useTransition, useTrail, useSpring } from '@react-spring/web'

function Transition({ prop, delay = 0, enter = {}, leave = {}, from = {}, ...props }) {
  const t = useTransition(prop, {
    from: { opacity: 0, ...from },
    enter: { opacity: 1, ...enter },
    leave: { opacity: 0, ...leave },
    immediate: false
  })

  return t((style, active) => {
    return active && <a.div style={style} {...props} />
  })
}

function Reveal({ height = 100, style: { height: h, ...styleProps } = {}, ...props }) {
  return (
    <a.div
      style={{
        overflow: 'hidden',
        ...styleProps
        //height: h.interpolate((d) => d * height)
      }}
      {...props}
    />
  )
}

export default function Ui({ progress = 100, hintVisibility }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = useTrail(5, {
    backgroundColor: isMenuOpen ? 1 : 0,
    opacity: isMenuOpen ? 1 : 0,
    height: isMenuOpen ? 1 : 0,
    y: isMenuOpen ? -10 : 10,
    config: {
      delay: 1000
    }
  })

  useEffect(() => {}, [])

  return (
    <a.div
      className="ui"
      style={{
        backgroundColor: menuItems[4].backgroundColor.interpolate((d) => `rgba(0,0,0,${d})`)
      }}>
      {/* <Transition className="center middle" prop={progress < 100}>
        <a.div className="fs3 ls2 tc">loading</a.div>
        <a.div
          style={{
            marginTop: 2,
            marginBottom: 6,
            width: prog.value.interpolate((d) => `${d.toFixed(0)}%`),
            height: 2,
            background: 'currentColor'
          }}></a.div>
        <a.div className="fs6 ttu ls2 tc">{prog.value.interpolate((d) => `${d.toFixed(0)}%`)}</a.div>
      </Transition> */}
      <Transition
        height={40}
        className="abs bottom right big"
        prop={!isMenuOpen}
        onClick={() => {
          setIsMenuOpen(!isMenuOpen)
        }}>
        Info
      </Transition>
      <Transition prop={isMenuOpen} className="ui full">
        <div className="flex page items-start">
          <Reveal height={450} style={menuItems[1]} className="w33">
            <p className="fs2 mb oh p10">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
              text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
            </p>
          </Reveal>
          <Reveal height={450} style={menuItems[2]} className="w33">
            <p className="fs2 mb oh p10">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
              text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
            </p>
          </Reveal>
          <Reveal height={450} style={menuItems[2]} className="w33">
            <p className="fs2 mb oh p10">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy
              text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged
            </p>
          </Reveal>
        </div>
      </Transition>
      <Transition
        prop={isMenuOpen}
        className="abs bottom right big"
        onClick={() => {
          setIsMenuOpen(!isMenuOpen)
        }}>
        Close
      </Transition>
    </a.div>
  )
}
