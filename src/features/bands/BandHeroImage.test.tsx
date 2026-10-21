import { fireEvent, render, screen } from '@testing-library/react'
import { BandHeroImage } from './BandHeroImage'

const props={name:'Queen',heroImageUrl:'https://upload.wikimedia.org/queen.jpg',imageAlt:'Queen en directo',imageAuthor:'Autor',imageLicense:'CC BY 4.0',imageSourceUrl:'https://commons.wikimedia.org/queen'}
test('renders licensed media and falls back to initials after an error',()=>{
  render(<BandHeroImage {...props}/>)
  expect(screen.getByAltText('Queen en directo')).toBeInTheDocument()
  expect(screen.getByText(/Autor · CC BY 4.0/)).toBeInTheDocument()
  fireEvent.error(screen.getByAltText('Queen en directo'))
  expect(screen.getByText('QU')).toBeInTheDocument()
})
test('rejects missing and non HTTPS images',()=>{
  const {rerender}=render(<BandHeroImage {...props} heroImageUrl={null}/>)
  expect(screen.getByText('QU')).toBeInTheDocument()
  rerender(<BandHeroImage {...props} heroImageUrl="http://example.com/a.jpg"/>)
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
})
