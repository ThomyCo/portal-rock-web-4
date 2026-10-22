import { expect, test } from '@playwright/test'

for (const viewport of [{width:360,height:800},{width:768,height:1024},{width:1440,height:900}]) {
  test(`homepage remains usable at ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading',{name:'Ruido, escenario y actualidad'})).toBeVisible()
    await expect(page.getByRole('heading',{name:'Conciertos en México'})).toBeVisible()
    await expect(page.getByRole('link',{name:'Explorar mapa interactivo'})).toBeVisible()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(viewport.width)
  })
}
