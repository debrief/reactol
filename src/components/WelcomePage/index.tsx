// src/components/WelcomePage/index.tsx
import { Button, Col, Image, Row, Typography } from 'antd'
import './styles.css'
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

interface WelcomePageProps {
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  handleNew: (withSampleData: boolean) => void
  openExistingDocument: () => void
}

const WelcomePage: React.FC<WelcomePageProps> = ({
  onDragOver,
  onDragLeave,
  onDrop,
  handleNew,
  openExistingDocument
}) => {
  const { t } = useTranslation();
  const gitBranch = import.meta.env.VITE_GIT_BRANCH || t('unknown');
  const buildDate = import.meta.env.VITE_BUILD_DATE 
    ? new Date(import.meta.env.VITE_BUILD_DATE).toLocaleString()
    : t('unknown');
  return (
    <div style={{ paddingTop: '50px' }} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <Row>
        <Col span={24}><Typography.Title>{t('welcomeToAlbatross')}</Typography.Title></Col>
      </Row>
      <Row>
        <Col span={24}>&nbsp;</Col>
      </Row>
      <Row align='middle' justify='start'>
        <Col span={12}>
          <Image alt={t('applicationLogoAlt')} preview={false} width={200} src='images/albatross-flying.png' />
        </Col>
        <Col span={12}>
          <Row style={{ paddingBottom: '12px' }}>
            <Col span={6}>&nbsp;</Col>
            <Col span={12}><Typography.Text type='secondary'>{t('openOrCreateDocument')}</Typography.Text></Col>
          </Row>
          <Row>
            <Col span={6}></Col>
            <Col span={12}>
              <Button onClick={() => handleNew(false)} size='large' type='primary'>{t('new')}</Button>
              <Button style={{fontStyle: 'italic', marginLeft: '10px'}} onClick={() => handleNew(true)} size='large' type='primary'>{t('samplePlot')}</Button>
            </Col>
          </Row>
          <Row style={{ paddingTop: '25px' }}>
            <Col span={8}></Col>
            <Col span={8}><Button onClick={openExistingDocument} size='large' block type='primary'>{t('open')}</Button></Col>
          </Row>
        </Col>
      </Row>
      <div className="language-selector">
        <LanguageSelector/>
      </div>
      
      <div className="debug-info">
        {t('branch')}: <strong>{gitBranch}</strong> | {t('build')}: <strong>{buildDate}</strong>
      </div>
    </div>
  )
}

export default WelcomePage