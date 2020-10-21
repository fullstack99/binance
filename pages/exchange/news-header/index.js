import React, { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { Typography, Collapse } from 'antd'
import { zendeskNewsActions, zendeskNewsSelector } from 'store/zendesk-news'
import { FormattedMessage } from 'react-intl'
import { RightOutlined } from '@ant-design/icons'
import moment from 'moment'
import styles from './index.module.scss'

const { Paragraph } = Typography

export default function NewsHeader({ locale }) {
  const dispatch = useDispatch()
  const { latestData } = useSelector(zendeskNewsSelector.zendesk)
  const news = latestData.articles
  const [isExpand, setIsExpand] = useState(false)

  const fetchNews = useCallback(() => {
    dispatch(
      zendeskNewsActions.fetch.start({
        locale,
        perPage: 11,
      }),
    )
  }, [dispatch, locale])

  useEffect(() => {
    fetchNews()
  }, [fetchNews])

  function handleExpand() {
    setIsExpand(!isExpand)
  }

  return (
    <div className={styles.newsContainer}>
      <ul className={styles.newsList}>
        {news?.slice(0, 3).map(d => (
          <div className={styles.listContainer} key={d.title}>
            <li>
              <a target="_blang" rel="noopener noreferrer" href={d.html_url}>
                <Paragraph ellipsis className={styles.title}>
                  {d.title}
                </Paragraph>
              </a>
            </li>
            <span className={styles.date}>
              ({moment(d.created_at).format('MM-DD')})
            </span>
          </div>
        ))}
        <RightOutlined
          className={!isExpand ? styles.expandIcon : styles.expandIconExpand}
          onClick={handleExpand}
        />
      </ul>
      <Collapse
        className={
          !isExpand ? styles.collapseContainerHide : styles.collapseContainer
        }
      >
        <ul className={styles.newsListInner}>
          {news?.slice(3, 8).map(d => (
            <div className={styles.listInnerContainer} key={d.title}>
              <li>
                <a target="_blang" rel="noopener noreferrer" href={d.html_url}>
                  <Paragraph ellipsis className={styles.title}>
                    {d.title}
                  </Paragraph>
                </a>
              </li>
              <span className={styles.dateInner}>
                ({moment(d.created_at).format('MM-DD')})
              </span>
            </div>
          ))}
          <li className={styles.moreInnerList}>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={
                locale === 'th'
                  ? 'https://satang.zendesk.com/hc/th/sections/360008026691-ประกาศ'
                  : 'https://satang.zendesk.com/hc/en-us/sections/360008026691-Announcements'
              }
            >
              <Paragraph ellipsis className={styles.titleMore}>
                <FormattedMessage id="more_news" />
              </Paragraph>
            </a>
          </li>
        </ul>
      </Collapse>
    </div>
  )
}

NewsHeader.propTypes = {
  locale: PropTypes.string.isRequired,
}
